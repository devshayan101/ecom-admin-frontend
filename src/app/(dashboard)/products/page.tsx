"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGetPaginated, getApiError } from "@/lib/api-client";
import { usePagination } from "@/hooks/usePagination";
import type { Product } from "@/lib/types";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { PRODUCT_STATUS_LABELS } from "@/lib/constants";
import { Plus, Search } from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const fetcher = (params: Record<string, any>) => {
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (tagFilter) params.tag = tagFilter;
    return apiGetPaginated<Product>("/products", params);
  };

  const { items: products, loading, hasMore, loadMore, reset } = usePagination<Product>(fetcher);

  const columns = [
    {
      key: "name",
      title: "Product",
      render: (p: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md border border-border overflow-hidden bg-muted/50 flex-shrink-0">
            {p.images && p.images[0] ? (
              <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
            ) : p.variants?.[0]?.image ? (
              <img src={p.variants[0].image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[10px] text-gray-400">No img</span>
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.variants?.[0]?.sku || p._id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category_id",
      title: "Category",
      render: (p: Product) => <span>{p.category_name || p.category_id}</span>,
    },
    {
      key: "status",
      title: "Status",
      render: (p: Product) => (
        <Badge variant={p.status === "active" ? "success" : p.status === "draft" ? "warning" : "outline"}>
          {PRODUCT_STATUS_LABELS[p.status] || p.status}
        </Badge>
      ),
    },
    {
      key: "variants",
      title: "Variants",
      render: (p: Product) => <span>{p.variants?.length || 0}</span>,
    },
    {
      key: "actions",
      title: "Actions",
      render: (p: Product) => (
        <button
          onClick={() => router.push(`/products/${p._id}`)}
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
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <Link href="/products/new">
          <Button><Plus className="h-4 w-4 mr-2" /> New Product</Button>
        </Link>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Input
            label="Search"
            id="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Select
            label="Status"
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "", label: "All" },
              { value: "active", label: "Active" },
              { value: "draft", label: "Draft" },
              { value: "archived", label: "Archived" },
            ]}
          />
        </div>
        <Button variant="secondary" onClick={() => { reset(); setSearch(""); setStatusFilter(""); }}>
          Reset
        </Button>
        <Button onClick={() => reset()}>
          <Search className="h-4 w-4 mr-2" /> Search
        </Button>
      </div>

      <Table
        data={products}
        columns={columns}
        keyExtractor={(p) => p._id}
        loading={loading && products.length === 0}
        emptyMessage="No products found. Create your first product."
      />

      {hasMore && (
        <div className="text-center py-4">
          <Button variant="secondary" onClick={loadMore} loading={loading}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
