"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPut, apiDelete, getApiError } from "@/lib/api-client";
import type { Product, Category, AttributeSchema, Settings, TaxSlab } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Trash2, Plus, X } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";
import ImageUpload from "@/components/ImageUpload";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { hasPermission } = useAuthContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySchema, setCategorySchema] = useState<AttributeSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData, settingsData] = await Promise.all([
          apiGet<Product>(`/products/${id}`),
          apiGet<{ items: Category[] }>("/categories?limit=100"),
          apiGet<Settings>("/settings"),
        ]);

        const rules = settingsData.taxes?.taxRules || [];
        const regions = Array.from(new Set(rules.map((r: any) => {
          return r.state ? `${r.country} - ${r.state}` : r.country;
        })));

        const mergedSlabs = regions.map(reg => {
          const saved = prodData.tax_slabs?.find((s: any) => s.region === reg);
          return { region: reg, rate: saved ? saved.rate : 0 };
        });

        setProduct({
          ...prodData,
          tax_slabs: mergedSlabs
        });
        setCategories(catData.items || []);
        
        const category = catData.items?.find((c: Category) => c._id === prodData.category_id);
        if (category) {
          setCategorySchema(category.attribute_schema || []);
        }
      } catch (err: any) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (product && categories.length > 0) {
      const category = categories.find(c => c._id === product.category_id);
      setCategorySchema(category?.attribute_schema || []);
    }
  }, [product?.category_id, categories]);

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    setError("");
    try {
      await apiPut(`/products/${id}`, {
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        tags: product.tags,
        images: product.images,
        status: product.status,
        variants: product.variants.map((v) => ({
          _id: v._id,
          sku: v.sku,
          price: v.price,
          image: v.image,
          stock: v.stock !== undefined ? Number(v.stock) : undefined,
          low_stock_threshold: v.low_stock_threshold !== undefined ? Number(v.low_stock_threshold) : undefined,
          attributes: v.attributes,
        })),
        tax_slabs: product.tax_slabs,
      });
      router.push("/products");
    } catch (err: any) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (force: boolean = false) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiDelete(`/products/${id}${force ? "?force=true" : ""}`);
      router.push("/products");
    } catch (err: any) {
      setError(getApiError(err));
    }
  };

  const updateVariant = (index: number, field: string, value: any) => {
    if (!product) return;
    const newVariants = [...product.variants];
    if (field.startsWith("attributes.")) {
      const attrKey = field.split(".")[1];
      newVariants[index].attributes = { ...newVariants[index].attributes, [attrKey]: value };
    } else {
      (newVariants[index] as any)[field] = value;
    }
    setProduct({ ...product, variants: newVariants });
  };

  const addVariant = () => {
    if (!product) return;
    const initialAttrs: Record<string, any> = {};
    categorySchema.forEach(attr => {
      initialAttrs[attr.key] = attr.type === 'boolean' ? false : (attr.type === 'number' ? 0 : "");
    });
    setProduct({
      ...product,
      variants: [...product.variants, { _id: "", sku: "", price: 0, stock: 0, low_stock_threshold: 10, attributes: initialAttrs }]
    });
  };

  const removeVariant = (index: number) => {
    if (!product) return;
    setProduct({
      ...product,
      variants: product.variants.filter((_, i) => i !== index)
    });
  };

  const addTag = () => {
    if (product && tagInput && !product.tags.includes(tagInput)) {
      setProduct({ ...product, tags: [...product.tags, tagInput] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    if (product) {
      setProduct({ ...product, tags: product.tags.filter(t => t !== tag) });
    }
  };

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  if (!product) return <div className="py-12 text-center text-muted-foreground">Product not found</div>;

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
        </div>
        {hasPermission("products:write") && (
          <div className="flex gap-3">
            <Button variant="destructive" onClick={() => handleDelete(false)}>
              <Trash2 className="h-4 w-4 mr-2" /> Archive
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><h2 className="text-lg font-semibold">Basic Info</h2></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Name" value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})} />
              <Textarea
                label="Description"
                value={product.description || ""}
                onChange={(e) => setProduct({...product, description: e.target.value})}
                rows={5}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="text-lg font-semibold">Product Images</h2></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {product.images.map((img, i) => (
                  <div key={i} className="relative w-24 h-24 border rounded-md overflow-hidden group">
                    <img src={img} alt={`Product ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setProduct({...product, images: product.images.filter((_, idx) => idx !== i)})}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <ImageUpload 
                  onChange={(url) => setProduct({...product, images: [...product.images, url]})} 
                  onRemove={() => {}} 
                />
              </div>
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
              {product.variants.map((v, i) => (
                <div key={v._id || i} className="p-4 border border-border rounded-lg space-y-4 relative">
                  {product.variants.length > 1 && (
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
                        required
                      />
                      <Input
                        label="Price"
                        value={v.price}
                        onChange={(e) => updateVariant(i, "price", parseFloat(e.target.value) || 0)}
                        type="number"
                        step="0.01"
                        required
                      />
                      {!v._id ? (
                        <>
                          <Input
                            label="Initial Stock"
                            value={v.stock !== undefined ? String(v.stock) : "0"}
                            onChange={(e) => updateVariant(i, "stock", e.target.value)}
                            type="number"
                            required
                          />
                          <Input
                            label="Low Stock Threshold"
                            value={v.low_stock_threshold !== undefined ? String(v.low_stock_threshold) : "10"}
                            onChange={(e) => updateVariant(i, "low_stock_threshold", e.target.value)}
                            type="number"
                            required
                          />
                        </>
                      ) : (
                        <div className="md:col-span-2 text-xs text-muted-foreground bg-muted p-2 rounded-md">
                          Stock is managed through the <Link href="/inventory" className="text-primary hover:underline font-medium">Inventory page</Link>
                        </div>
                      )}
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
                value={product.category_id}
                onChange={(e) => setProduct({...product, category_id: e.target.value})}
                options={[
                  { value: "", label: "Select..." },
                  ...categories.map((c) => ({ value: c._id, label: c.name })),
                ]}
              />
              <Select
                label="Status"
                value={product.status}
                onChange={(e) => setProduct({...product, status: e.target.value as any})}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "active", label: "Active" },
                  { value: "archived", label: "Archived" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="text-lg font-semibold">Tax Category Slabs</h2></CardHeader>
            <CardContent className="space-y-4">
              {!product.tax_slabs || product.tax_slabs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No tax regions configured in Settings.</p>
              ) : (
                product.tax_slabs.map((slab, idx) => (
                  <div key={slab.region} className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">{slab.region}</label>
                    <div className="flex gap-2">
                      <Select
                        value={[0, 5, 12, 18, 28].includes(slab.rate) ? String(slab.rate) : "custom"}
                        onChange={(e) => {
                          if (e.target.value !== "custom") {
                            const newSlabs = [...(product.tax_slabs || [])];
                            newSlabs[idx].rate = parseFloat(e.target.value) || 0;
                            setProduct({ ...product, tax_slabs: newSlabs });
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
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={slab.rate}
                        onChange={(e) => {
                          const newSlabs = [...(product.tax_slabs || [])];
                          newSlabs[idx].rate = parseFloat(e.target.value) || 0;
                          setProduct({ ...product, tax_slabs: newSlabs });
                        }}
                        placeholder="Rate %"
                        className="w-24"
                      />
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
                {product.tags.map((tag) => (
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
        {hasPermission("products:write") && (
          <Button onClick={handleSave} loading={saving} className="px-8">Save Changes</Button>
        )}
      </div>
    </div>
  );
}
