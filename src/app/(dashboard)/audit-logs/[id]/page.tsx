"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiGet, getApiError } from "@/lib/api-client";
import type { AuditLog } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import { ArrowLeft } from "lucide-react";

export default function AuditLogDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [log, setLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const data = await apiGet<AuditLog>(`/audit-logs/${id}`);
        setLog(data);
      } catch (err: any) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLog();
  }, [id]);

  if (loading) return <div className="py-12 text-center"><LoadingSpinner /></div>;
  if (error) return <div className="py-12 text-center text-red-600">{error}</div>;
  if (!log) return <div className="py-12 text-center text-gray-500">Log entry not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log Detail</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Log Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Log ID</span>
              <span className="font-medium text-sm">{log._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Date</span>
              <span className="text-sm">{new Date(log.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Action</span>
              <span className="font-medium text-sm">{log.action}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Result</span>
              <Badge variant={log.result === "success" ? "success" : log.result === "rejected" ? "warning" : "destructive"}>
                {log.result}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Actor Type</span>
              <span className="font-medium text-sm">{log.actor_type}</span>
            </div>
            {log.actor_id && (
              <div className="flex justify-between">
                <span className="text-sm text-foreground">Actor ID</span>
                <span className="font-medium text-sm">{log.actor_id}</span>
              </div>
            )}
            {log.actor_name && (
              <div className="flex justify-between">
                <span className="text-sm text-foreground">Actor Name</span>
                <span className="font-medium text-sm">{log.actor_name}</span>
              </div>
            )}
            {log.ip && (
              <div className="flex justify-between">
                <span className="text-sm text-foreground">IP Address</span>
                <span className="font-medium text-sm">{log.ip}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entity Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Entity Type</span>
              <span className="font-medium text-sm">{log.entity_type}</span>
            </div>
            {log.entity_id && (
              <div className="flex justify-between">
                <span className="text-sm text-foreground">Entity ID</span>
                <span className="font-medium text-sm">{log.entity_id}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {(log.error_code || log.error_message) && (
          <Card>
            <CardHeader>
              <CardTitle>Error Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {log.error_code && (
                <div className="flex justify-between">
                  <span className="text-sm text-foreground">Error Code</span>
                  <span className="font-medium text-sm text-red-600">{log.error_code}</span>
                </div>
              )}
              {log.error_message && (
                <div>
                  <span className="text-sm text-foreground">Error Message</span>
                  <p className="mt-1 text-sm text-red-600">{log.error_message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {log.changes && (log.changes.before || log.changes.after) && (
        <Card>
          <CardHeader>
            <CardTitle>Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {log.changes.before && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Before</h4>
                  <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(log.changes.before, null, 2)}
                  </pre>
                </div>
              )}
              {log.changes.after && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">After</h4>
                  <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(log.changes.after, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
