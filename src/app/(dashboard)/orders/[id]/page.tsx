"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiGet, apiPatch, getApiError } from "@/lib/api-client";
import type { Order, UpdateOrderStatusRequest } from "@/lib/types";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "@/lib/constants";
import { useAuthContext } from "@/providers/AuthProvider";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { hasPermission } = useAuthContext();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await apiGet<Order>(`/orders/${id}`);
        setOrder(data);
      } catch (err: any) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    setSaving(true);
    setError("");
    try {
      await apiPatch(`/orders/${id}/status`, { status: newStatus } as UpdateOrderStatusRequest);
      const updated = await apiGet<Order>(`/orders/${id}`);
      setOrder(updated);
    } catch (err: any) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12 text-center">Loading...</div>;
  if (!order) return <div className="py-12 text-center">Order not found</div>;

  const allowedTransitions = ORDER_STATUS_FLOW[order.status] || [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Status</span>
              <Badge variant={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "destructive" : "outline"}>
                {ORDER_STATUS_LABELS[order.status] || order.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Payment</span>
              <Badge variant={order.payment_status === "PAID" ? "success" : "warning"}>
                {order.payment_status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Total</span>
              <span className="font-medium">${order.total_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Date</span>
              <span className="text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allowedTransitions.length > 0 && hasPermission("orders:write") ? (
              <div>
                <p className="text-sm text-foreground mb-2">Allowed transitions:</p>
                <div className="flex gap-2 flex-wrap">
                  {allowedTransitions.map((status) => (
                    <Button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      loading={saving}
                      variant={status === "CANCELLED" ? "destructive" : "primary"}
                    >
                      {ORDER_STATUS_LABELS[status] || status}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No further transitions available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items ({order.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">{item.sku}</p>
                  <p className="text-sm text-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">${item.price_at_purchase?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {order.shipping_address && (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{order.shipping_address.recipient_name}</p>
            <p>{order.shipping_address.street}</p>
            <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postcode}</p>
            <p>{order.shipping_address.country}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
