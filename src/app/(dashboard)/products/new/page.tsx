"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost, apiGet, getApiError } from "@/lib/api-client";
import type { Category, CreateProductRequest } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"active" | "draft">("draft");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [variants, setVariants] = useState<{ sku: string; price: string; attributes: Record<string, string> }[]>([
    { sku: "", price: "", attributes: {} },
  ]);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet<Category[]>("/categories?limit=100").then(setCategories).catch(console.error);
  }, []);

  const addVariant = () => {
    setVariants([...variants, { sku: "", price: "", attributes: {} }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    setVariants(newVariants);
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
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
          attributes: v.attributes,
        })),
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
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/products" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Basic Info</h2></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Name" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
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
          <CardHeader><h2 className="text-lg font-semibold">Variants</h2></CardHeader>
          <CardContent className="space-y-4">
            {variants.map((v, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-md space-y-3">
                <div className="flex gap-4">
                  <Input
                    label="SKU"
                    value={v.sku}
                    onChange={(e) => updateVariant(i, "sku", e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Input
                    label="Price"
                    value={v.price}
                    onChange={(e) => updateVariant(i, "price", e.target.value)}
                    type="number"
                    className="w-32"
                    required
                  />
                  {variants.length > 1 && (
                    <button type="button" onClick={() => removeVariant(i)} className="mt-6 text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addVariant}>
              <Plus className="h-4 w-4 mr-2" /> Add Variant
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>Create Product</Button>
          <Link href="/products">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
