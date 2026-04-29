"use client";

import { useState } from "react";
import { apiGetPaginated, getApiError } from "@/lib/api-client";
import { usePagination } from "@/hooks/usePagination";
import type { AuditLog } from "@/lib/types";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Search } from "lucide-react";

export default function AuditLogsPage() {
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [actorTypeFilter, setActorTypeFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetcher = (params: Record<string, any>) => {
    if (entityTypeFilter) params.entity_type = entityTypeFilter;
    if (actorTypeFilter) params.actor_type = actorTypeFilter;
    if (resultFilter) params.result = resultFilter;
    if (search) params.search = search;
    return apiGetPaginated<AuditLog>("/audit-logs", params);
  };

  const { items: logs, loading, hasMore, loadMore, reset } = usePagination<AuditLog>(fetcher);

  const columns = [
    {
      key: "created_at",
      title: "Date",
      render: (log: AuditLog) => (
        <span className="text-sm text-gray-600">
          {new Date(log.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      key: "actor",
      title: "Actor",
      render: (log: AuditLog) => (
        <div>
          <p className="font-medium text-gray-900">{log.actor_name || "Unknown"}</p>
          <p className="text-xs text-gray-500">{log.actor_type}</p>
        </div>
      ),
    },
    {
      key: "action",
      title: "Action",
      render: (log: AuditLog) => (
        <span className="text-sm text-gray-900">{log.action}</span>
      ),
    },
    {
      key: "entity",
      title: "Entity",
      render: (log: AuditLog) => (
        <div>
          <p className="text-sm text-gray-900">{log.entity_type}</p>
          {log.entity_id && (
            <p className="text-xs text-gray-500">{log.entity_id}</p>
          )}
        </div>
      ),
    },
    {
      key: "result",
      title: "Result",
      render: (log: AuditLog) => (
        <Badge variant={log.result === "success" ? "success" : log.result === "rejected" ? "warning" : "destructive"}>
          {log.result}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (log: AuditLog) => (
        <a
          href={`/audit-logs/${log._id}`}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          View
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="entity-type" className="block text-sm font-medium text-gray-700 mb-1">
            Entity Type
          </label>
          <select
            id="entity-type"
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All</option>
            <option value="product">Product</option>
            <option value="category">Category</option>
            <option value="order">Order</option>
            <option value="customer">Customer</option>
            <option value="inventory">Inventory</option>
          </select>
        </div>

        <div>
          <label htmlFor="actor-type" className="block text-sm font-medium text-gray-700 mb-1">
            Actor Type
          </label>
          <select
            id="actor-type"
            value={actorTypeFilter}
            onChange={(e) => setActorTypeFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All</option>
            <option value="admin">Admin</option>
            <option value="system">System</option>
            <option value="webhook">Webhook</option>
          </select>
        </div>

        <div>
          <label htmlFor="result" className="block text-sm font-medium text-gray-700 mb-1">
            Result
          </label>
          <select
            id="result"
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => reset()}>
          <Search className="h-4 w-4 mr-2" /> Search
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            reset();
            setEntityTypeFilter("");
            setActorTypeFilter("");
            setResultFilter("");
            setSearch("");
          }}
        >
          Reset
        </Button>
      </div>

      {loading && logs.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
          <Table
            data={logs}
            columns={columns}
            keyExtractor={(log) => log._id}
            loading={loading}
            emptyMessage="No audit logs found."
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
