"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiGetPaginated, getApiError } from "@/lib/api-client";
import { usePagination } from "@/hooks/usePagination";
import type { Order } from "@/lib/types";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { Search } from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetcher = (params: Record<string, any>) => {
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    return apiGetPaginated<Order>("/orders", params);
  };

  const { items: orders, loading, hasMore, loadMore, reset } = usePagination<Order>(fetcher);

  const columns = [
    {
      key: "customer_id",
      title: "Customer",
      render: (o: Order) => (
        <div>
          <p className="font-medium text-foreground">{o.customer_name || "Customer"}</p>
          <p className="text-xs text-muted-foreground">{o.customer_id}</p>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (o: Order) => (
        <Badge variant={o.status === "DELIVERED" ? "success" : o.status === "CANCELLED" ? "destructive" : "outline"}>
          {ORDER_STATUS_LABELS[o.status] || o.status}
        </Badge>
      ),
    },
    {
      key: "payment_status",
      title: "Payment",
      render: (o: Order) => (
        <Badge variant={o.payment_status === "PAID" ? "success" : "warning"}>
          {o.payment_status}
        </Badge>
      ),
    },
    {
      key: "total_amount",
      title: "Total",
      render: (o: Order) => <span>${o.total_amount?.toFixed(2)}</span>,
    },
    {
      key: "actions",
      title: "Actions",
      render: (o: Order) => (
        <button
          onClick={() => router.push(`/orders/${o._id}`)}
          className="text-sm text-primary hover:text-blue-500"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Orders</h1>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Input
            label="Search"
            id="search"
            placeholder="Search orders..."
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
              { value: "PENDING", label: "Pending" },
              { value: "CONFIRMED", label: "Confirmed" },
              { value: "SHIPPED", label: "Shipped" },
              { value: "DELIVERED", label: "Delivered" },
              { value: "CANCELLED", label: "Cancelled" },
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
        data={orders}
        columns={columns}
        keyExtractor={(o) => o._id}
        loading={loading && orders.length === 0}
        emptyMessage="No orders found."
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
