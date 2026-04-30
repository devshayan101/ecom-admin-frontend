"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGetPaginated, getApiError } from "@/lib/api-client";
import { usePagination } from "@/hooks/usePagination";
import type { Customer } from "@/lib/types";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Search } from "lucide-react";

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const fetcher = (params: Record<string, any>) => {
    if (search) params.search = search;
    return apiGetPaginated<Customer>("/customers", params);
  };

  const { items: customers, loading, hasMore, loadMore, reset } = usePagination<Customer>(fetcher);

  const columns = [
    {
      key: "name",
      title: "Name",
      render: (c: Customer) => (
        <div>
          <p className="font-medium text-foreground">{c.name}</p>
          <p className="text-xs text-muted-foreground">{c.email}</p>
        </div>
      ),
    },
    {
      key: "is_active",
      title: "Status",
      render: (c: Customer) => (
        <Badge variant={c.is_active ? "success" : "destructive"}>
          {c.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (c: Customer) => (
        <button
          onClick={() => router.push(`/customers/${c._id}`)}
          className="text-sm text-primary hover:text-blue-500"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <Link href="/customers/new">
          <Button>New Customer</Button>
        </Link>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Input
            label="Search"
            id="search"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => reset()} variant="secondary">
          <Search className="h-4 w-4 mr-2" /> Search
        </Button>
      </div>

      <Table
        data={customers}
        columns={columns}
        keyExtractor={(c) => c._id}
        loading={loading && customers.length === 0}
        emptyMessage="No customers found."
      />

      {hasMore && (
        <div className="text-center py-4">
          <Button onClick={loadMore} variant="secondary">Load More</Button>
        </div>
      )}
    </div>
  );
}
