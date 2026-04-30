"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGetPaginated, getApiError } from "@/lib/api-client";
import { usePagination } from "@/hooks/usePagination";
import type { Category } from "@/lib/types";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { PRODUCT_STATUS_LABELS } from "@/lib/constants";

export default function CategoriesPage() {
  const router = useRouter();
  const { items: categories, loading, error, loadMore, hasMore, reset } = usePagination<Category>(
    (params) => apiGetPaginated<Category>("/categories", params)
  );

  const columns = [
    {
      key: "name",
      title: "Name",
      render: (cat: Category) => (
        <div>
          <p className="font-medium text-foreground">{cat.name}</p>
          <p className="text-xs text-muted-foreground">{cat.slug}</p>
        </div>
      ),
    },
    {
      key: "attribute_schema",
      title: "Attributes",
      render: (cat: Category) => (
        <div className="flex gap-1 flex-wrap">
          {cat.attribute_schema?.map((attr) => (
            <Badge key={attr.key}>{attr.key} ({attr.type})</Badge>
          ))}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (cat: Category) => (
        <button
          onClick={() => router.push(`/categories/${cat._id}`)}
          className="text-sm text-primary hover:text-blue-500"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <Link href="/categories/new">
          <Button>New Category</Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <Table
        data={categories}
        columns={columns}
        keyExtractor={(cat) => cat._id}
        loading={loading && categories.length === 0}
        emptyMessage="No categories found. Create your first category to get started."
      />

      {hasMore && (
        <div className="text-center py-4">
          <Button onClick={loadMore} loading={loading} variant="secondary">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
