"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost, getApiError } from "@/lib/api-client";
import type { CreateCategoryRequest, AttributeSchema } from "@/lib/types";
import { PRODUCT_STATUS_LABELS } from "@/lib/constants";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [attributes, setAttributes] = useState<AttributeSchema[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: CreateCategoryRequest = {
        name,
        slug,
        parent_id: parentId || undefined,
        attribute_schema: attributes,
      };
      await apiPost("/categories", payload);
      router.push("/categories");
    } catch (err: any) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/categories" className="text-gray-500 hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Category</h1>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Input
              label="Name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="flex gap-2">
              <Input
                label="Slug"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
              <Button type="button" onClick={generateSlug} variant="secondary" className="mt-6">
                Generate
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Attribute Schema
              </label>
              <div className="space-y-2">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <Input
                      label="Key"
                      value={attr.key}
                      onChange={(e) => {
                        const newAttrs = [...attributes];
                        newAttrs[index].key = e.target.value;
                        setAttributes(newAttrs);
                      }}
                      className="flex-1"
                    />
                    <select
                      value={attr.type}
                      onChange={(e) => {
                        const newAttrs = [...attributes];
                        newAttrs[index].type = e.target.value as any;
                        setAttributes(newAttrs);
                      }}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="string">Text</option>
                      <option value="number">Number</option>
                      <option value="boolean">Yes/No</option>
                      <option value="enum">Dropdown</option>
                    </select>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setAttributes(attributes.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setAttributes([...attributes, { key: "", type: "string" }])}
                className="mt-2"
              >
                Add Attribute
              </Button>
            </div>

            <Button type="submit" loading={loading} className="mt-4">
              Create Category
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
