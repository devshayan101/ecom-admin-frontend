"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPut, apiDelete, getApiError } from "@/lib/api-client";
import type { Product, Category } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { hasPermission } = useAuthContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          apiGet<Product>(`/products/${id}`),
          apiGet<Category[]>("/categories?limit=100"),
        ]);
        setProduct(prodData);
        setCategories(catData);
      } catch (err: any) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

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
          attributes: v.attributes,
        })),
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

  if (loading) return <div className="py-12 text-center">Loading...</div>;
  if (!product) return <div className="py-12 text-center">Product not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
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

      <Card>
        <CardHeader><h2 className="text-lg font-semibold">Basic Info</h2></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Name" value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={product.description || ""}
              onChange={(e) => setProduct({...product, description: e.target.value})}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={3}
            />
          </div>
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
        <CardHeader><h2 className="text-lg font-semibold">Variants ({product.variants.length})</h2></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {product.variants.map((v, i) => (
              <div key={v._id} className="p-4 border border-gray-200 rounded-md">
                <p className="font-medium text-sm">{v.sku} - ${v.price}</p>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {Object.entries(v.attributes || {}).map(([key, val]) => (
                    <Badge key={key}>{key}: {String(val)}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {hasPermission("products:write") && (
        <div className="flex gap-3">
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      )}
    </div>
  );
}
