"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost, apiGet, getApiError } from "@/lib/api-client";
import type { Category, CreateProductRequest, AttributeSchema, Settings, TaxSlab } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySchema, setCategorySchema] = useState<AttributeSchema[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"active" | "draft">("draft");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [variants, setVariants] = useState<{ sku: string; price: string; image?: string; stock: string; low_stock_threshold: string; attributes: Record<string, any> }[]>([
    { sku: "", price: "", stock: "0", low_stock_threshold: "10", attributes: {} },
  ]);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [productTaxSlabs, setProductTaxSlabs] = useState<TaxSlab[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);

  useEffect(() => {
    apiGet<{ items: Category[] }>("/categories?limit=100")
      .then((data) => setCategories(data.items || []))
      .catch(console.error);

    apiGet<Settings>("/settings")
      .then((settings) => {
        const rules = settings.taxes?.taxRules || [];
        const regions = Array.from(new Set(rules.map((r: any) => {
          return r.state ? `${r.country} - ${r.state}` : r.country;
        })));
        setAvailableRegions(regions);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (categoryId) {
      const category = categories.find(c => c._id === categoryId);
      if (category) {
        setCategorySchema(category.attribute_schema || []);
        // Update existing variants to include new attributes if missing
        setVariants(prev => prev.map(v => {
          const newAttrs = { ...v.attributes };
          category.attribute_schema?.forEach(attr => {
            if (newAttrs[attr.key] === undefined) {
              newAttrs[attr.key] = attr.type === 'boolean' ? false : (attr.type === 'number' ? 0 : "");
            }
          });
          return { ...v, attributes: newAttrs };
        }));
      }
    } else {
      setCategorySchema([]);
    }
  }, [categoryId, categories]);

  const addVariant = () => {
    const initialAttrs: Record<string, any> = {};
    categorySchema.forEach(attr => {
      initialAttrs[attr.key] = attr.type === 'boolean' ? false : (attr.type === 'number' ? 0 : "");
    });
    setVariants([...variants, { sku: "", price: "", stock: "0", low_stock_threshold: "10", attributes: initialAttrs }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    if (field.startsWith("attributes.")) {
      const attrKey = field.split(".")[1];
      newVariants[index].attributes[attrKey] = value;
    } else {
      (newVariants[index] as any)[field] = value;
    }
    setVariants(newVariants);
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: CreateProductRequest = {
        name,
        description,
        category_id: categoryId,
        tags,
        images,
        status,
        variants: variants.map((v) => ({
          sku: v.sku,
          price: parseFloat(v.price) || 0,
          image: v.image,
          stock: parseInt(v.stock) || 0,
          low_stock_threshold: parseInt(v.low_stock_threshold) || 10,
          attributes: v.attributes,
        })),
        tax_slabs: productTaxSlabs,
      };
      await apiPost("/products", payload);
      router.push("/products");
    } catch (err: any) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div className="flex items-center gap-4">
        <Link href="/products" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Product</h1>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader><h2 className="text-lg font-semibold">Basic Info</h2></CardHeader>
              <CardContent className="space-y-4">
                <Input label="Name" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Textarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><h2 className="text-lg font-semibold">Product Images</h2></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-24 h-24 border rounded-md overflow-hidden group">
                      <img src={img} alt={`Product ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <ImageUpload 
                    onChange={(url) => setImages([...images, url])} 
                    onRemove={() => {}} 
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Add up to 10 images. These will be shown on the product page.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Variants</h2>
                  <Button type="button" variant="secondary" size="sm" onClick={addVariant}>
                    <Plus className="h-4 w-4 mr-2" /> Add Variant
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {variants.map((v, i) => (
                  <div key={i} className="p-4 border border-border rounded-lg space-y-4 relative">
                    {variants.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeVariant(i)} 
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-1">
                        <ImageUpload
                          label="Variant Image"
                          value={v.image}
                          onChange={(url) => updateVariant(i, "image", url)}
                          onRemove={() => updateVariant(i, "image", undefined)}
                        />
                      </div>
                      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="SKU"
                          value={v.sku}
                          onChange={(e) => updateVariant(i, "sku", e.target.value)}
                          placeholder="e.g. TSHIRT-RED-M"
                          required
                        />
                        <Input
                          label="Price"
                          value={v.price}
                          onChange={(e) => updateVariant(i, "price", e.target.value)}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          required
                        />
                        <Input
                          label="Initial Stock"
                          value={v.stock}
                          onChange={(e) => updateVariant(i, "stock", e.target.value)}
                          type="number"
                          placeholder="0"
                          required
                        />
                        <Input
                          label="Low Stock Threshold"
                          value={v.low_stock_threshold}
                          onChange={(e) => updateVariant(i, "low_stock_threshold", e.target.value)}
                          type="number"
                          placeholder="10"
                          required
                        />
                      </div>
                    </div>

                    {categorySchema.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Attributes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {categorySchema.map((attr) => (
                            <div key={attr.key}>
                              {attr.type === 'enum' ? (
                                <Select
                                  label={attr.key}
                                  value={v.attributes[attr.key] || ""}
                                  onChange={(e) => updateVariant(i, `attributes.${attr.key}`, e.target.value)}
                                  options={[
                                    { value: "", label: `Select ${attr.key}...` },
                                    ...(attr.values || []).map(val => ({ value: val, label: val }))
                                  ]}
                                />
                              ) : attr.type === 'boolean' ? (
                                <div className="flex items-center gap-2 mt-8">
                                  <input
                                    type="checkbox"
                                    id={`attr-${i}-${attr.key}`}
                                    checked={!!v.attributes[attr.key]}
                                    onChange={(e) => updateVariant(i, `attributes.${attr.key}`, e.target.checked)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                  />
                                  <label htmlFor={`attr-${i}-${attr.key}`} className="text-sm font-medium text-gray-700">
                                    {attr.key}
                                  </label>
                                </div>
                              ) : (
                                <Input
                                  label={attr.key}
                                  type={attr.type === 'number' ? 'number' : 'text'}
                                  value={v.attributes[attr.key] || ""}
                                  onChange={(e) => updateVariant(i, `attributes.${attr.key}`, attr.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><h2 className="text-lg font-semibold">Organization</h2></CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Category"
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  options={[
                    { value: "", label: "Select category..." },
                    ...categories.map((c) => ({ value: c._id, label: c.name })),
                  ]}
                  required
                />
                <Select
                  label="Status"
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "active", label: "Active" },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Tax Category Slabs</h2>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setProductTaxSlabs([...productTaxSlabs, { region: "", rate: 0 }])}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Slab
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {productTaxSlabs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tax slabs configured for this product. Click "Add Slab" to configure one.</p>
                ) : (
                  productTaxSlabs.map((slab, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-end border border-border/60 bg-muted/20 p-4 rounded-xl shadow-sm relative">
                      <div className="col-span-12 md:col-span-5">
                        <Select
                          label="Region / Country"
                          value={slab.region}
                          onChange={(e) => {
                            const newSlabs = [...productTaxSlabs];
                            newSlabs[idx].region = e.target.value;
                            setProductTaxSlabs(newSlabs);
                          }}
                          options={[
                            { value: "", label: "Select region..." },
                            ...availableRegions.map(reg => ({ value: reg, label: reg }))
                          ]}
                          required
                        />
                      </div>
                      
                      <div className="col-span-6 md:col-span-3">
                        <label className="block text-sm font-medium text-foreground mb-1">Preset Slab</label>
                        <Select
                          value={[0, 5, 12, 18, 28].includes(slab.rate) ? String(slab.rate) : "custom"}
                          onChange={(e) => {
                            if (e.target.value !== "custom") {
                              const newSlabs = [...productTaxSlabs];
                              newSlabs[idx].rate = parseFloat(e.target.value) || 0;
                              setProductTaxSlabs(newSlabs);
                            }
                          }}
                          options={[
                            { value: "0", label: "0% (Zero)" },
                            { value: "5", label: "5% (Reduced)" },
                            { value: "12", label: "12%" },
                            { value: "18", label: "18% (Standard)" },
                            { value: "28", label: "28%" },
                            { value: "custom", label: "Custom..." }
                          ]}
                        />
                      </div>

                      <div className="col-span-6 md:col-span-3">
                        <Input
                          label="Rate (%)"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={slab.rate}
                          onChange={(e) => {
                            const newSlabs = [...productTaxSlabs];
                            newSlabs[idx].rate = parseFloat(e.target.value) || 0;
                            setProductTaxSlabs(newSlabs);
                          }}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-1 flex justify-center md:justify-end pb-1">
                        <button
                          type="button"
                          className="flex items-center justify-center p-2.5 rounded-lg border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer w-full md:w-auto h-9"
                          onClick={() => setProductTaxSlabs(productTaxSlabs.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><h2 className="text-lg font-semibold">Tags</h2></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="secondary" onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-gray-600">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-3 justify-end border-t pt-6">
          <Link href="/products">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" loading={loading} className="px-8">Create Product</Button>
        </div>
      </form>
    </div>
  );
}
