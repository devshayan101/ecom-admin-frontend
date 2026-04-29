"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiGetPaginated, getApiError } from "@/lib/api-client";
import { usePagination } from "@/hooks/usePagination";
import type { InventoryItem } from "@/lib/types";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function InventoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const fetcher = (params: Record<string, any>) => {
    if (search) params.search = search;
    return apiGetPaginated<InventoryItem>("/inventory", params);
  };

  const { items: inventory, loading, hasMore, loadMore, reset } = usePagination<InventoryItem>(fetcher);

  const columns = [
    {
      key: "product_name",
      title: "Product",
      render: (item: InventoryItem) => (
        <div>
          <p className="font-medium text-gray-900">{item.product_name || "Product"}</p>
          <p className="text-xs text-gray-500">{item.product_id}</p>
        </div>
      ),
    },
    {
      key: "sku",
      title: "SKU",
      render: (item: InventoryItem) => (
        <span className="text-sm text-gray-600">{item.sku}</span>
      ),
    },
    {
      key: "stock",
      title: "Stock",
      render: (item: InventoryItem) => (
        <span className="text-sm font-medium text-gray-900">{item.stock}</span>
      ),
    },
    {
      key: "reserved",
      title: "Reserved",
      render: (item: InventoryItem) => (
        <span className="text-sm text-gray-600">{item.reserved}</span>
      ),
    },
    {
      key: "available",
      title: "Available",
      render: (item: InventoryItem) => {
        const available = item.available ?? (item.stock - item.reserved);
        return <span className="text-sm font-medium text-gray-900">{available}</span>;
      },
    },
    {
      key: "status",
      title: "Status",
      render: (item: InventoryItem) => {
        const available = item.available ?? (item.stock - item.reserved);
        const isLow = available <= item.low_stock_threshold;
        return (
          <Badge variant={isLow ? "destructive" : "success"}>
            {isLow ? "Low Stock" : "In Stock"}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (item: InventoryItem) => (
        <button
          onClick={() => router.push(`/inventory/${item._id}`)}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Adjust
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search by SKU or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <Button onClick={() => reset()}>Search</Button>
        <Button variant="secondary" onClick={() => { reset(); setSearch(""); }}>
          Reset
        </Button>
      </div>

      {loading && inventory.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
          <Table
            data={inventory}
            columns={columns}
            keyExtractor={(item) => item._id}
            loading={loading}
            emptyMessage="No inventory items found."
          />

          {hasMore && (
            <div className="text-center py-4">
              <Button variant="secondary" onClick={loadMore} loading={loading}>
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
