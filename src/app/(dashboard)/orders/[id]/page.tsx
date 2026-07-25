"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiGet, apiPost, apiPatch, getApiError } from "@/lib/api-client";
import type { Order, UpdateOrderStatusRequest, ProcessRefundRequest } from "@/lib/types";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ArrowLeft, RefreshCw, DollarSign } from "lucide-react";
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

  // Refund Modal State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundType, setRefundType] = useState<"FULL" | "PARTIAL">("FULL");
  const [partialAmount, setPartialAmount] = useState<string>("");
  const [refundReason, setRefundReason] = useState("");
  const [restockItems, setRestockItems] = useState(true);
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState("");

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

  const remainingRefundable = order ? order.total_amount - (order.refund_amount || 0) : 0;

  const handleOpenRefundModal = () => {
    if (!order) return;
    setRefundType("FULL");
    setPartialAmount(remainingRefundable.toFixed(2));
    setRefundReason("");
    setRestockItems(true);
    setRefundError("");
    setShowRefundModal(true);
  };

  const handleProcessRefund = async () => {
    if (refunding || !order) return;
    setRefunding(true);
    setRefundError("");

    let amount: number | undefined = undefined;

    if (refundType === "PARTIAL") {
      const parsed = parseFloat(partialAmount);
      if (isNaN(parsed) || parsed <= 0) {
        setRefundError("Please enter a valid refund amount greater than 0");
        setRefunding(false);
        return;
      }
      if (parsed > remainingRefundable) {
        setRefundError(`Refund amount cannot exceed remaining balance of ${remainingRefundable.toFixed(2)}`);
        setRefunding(false);
        return;
      }
      amount = parsed;
    }

    try {
      const payload: ProcessRefundRequest = {
        amount,
        reason: refundReason,
        restock: restockItems,
      };
      const updatedOrder = await apiPost<Order>(`/orders/${id}/refund`, payload);
      setOrder(updatedOrder);
      setShowRefundModal(false);
    } catch (err: any) {
      setRefundError(getApiError(err));
    } finally {
      setRefunding(false);
    }
  };

  if (loading) return <div className="py-12 text-center">Loading...</div>;
  if (!order) return <div className="py-12 text-center">Order not found</div>;

  const currencySymbol = order.currency === "INR" ? "₹" : order.currency === "USD" ? "$" : `${order.currency || "$"} `;
  const allowedTransitions = ORDER_STATUS_FLOW[order.status] || [];
  const canRefund = (order.payment_status === "PAID" || order.payment_status === "PARTIALLY_REFUNDED") && remainingRefundable > 0 && hasPermission("orders:write");

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Order Details</h1>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Info</CardTitle>
            {canRefund && (
              <Button size="sm" variant="secondary" onClick={handleOpenRefundModal}>
                <RefreshCw className="h-4 w-4 mr-1" /> Process Refund
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Status</span>
              <Badge variant={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "destructive" : "outline"}>
                {ORDER_STATUS_LABELS[order.status] || order.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Payment Status</span>
              <Badge variant={order.payment_status === "PAID" ? "success" : order.payment_status === "REFUNDED" ? "destructive" : order.payment_status === "PARTIALLY_REFUNDED" ? "warning" : "outline"}>
                {order.payment_status}
              </Badge>
            </div>
            {order.payment_method && (
              <div className="flex justify-between">
                <span className="text-sm text-foreground">Payment Method</span>
                <span className="text-sm font-medium">{order.payment_method}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Total</span>
              <span className="font-medium">{currencySymbol}{order.total_amount?.toFixed(2)}</span>
            </div>
            {order.refund_amount ? (
              <div className="flex justify-between text-red-600">
                <span className="text-sm">Refunded</span>
                <span className="font-medium">-{currencySymbol}{order.refund_amount.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Date</span>
              <span className="text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            {order.refund_id && (
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-xs text-muted-foreground">Refund ID</span>
                <span className="text-xs font-mono">{order.refund_id}</span>
              </div>
            )}
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
              <p className="text-sm text-muted-foreground">No further status transitions available.</p>
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
                <p className="font-medium">{currencySymbol}{item.price_at_purchase?.toFixed(2)}</p>
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

      {/* Process Refund Modal */}
      <Modal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title="Process Refund"
      >
        <div className="space-y-4 pt-2">
          {refundError && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{refundError}</p>
            </div>
          )}

          <div className="bg-muted/30 p-3 rounded-md space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Order Total:</span>
              <span className="font-medium">{currencySymbol}{order.total_amount.toFixed(2)}</span>
            </div>
            {order.refund_amount ? (
              <div className="flex justify-between text-red-600">
                <span>Already Refunded:</span>
                <span>-{currencySymbol}{order.refund_amount.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t pt-1 font-semibold">
              <span>Max Refundable:</span>
              <span>{currencySymbol}{remainingRefundable.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Refund Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="refundType"
                  checked={refundType === "FULL"}
                  onChange={() => setRefundType("FULL")}
                  className="rounded text-primary focus:ring-primary"
                />
                Full Refund ({currencySymbol}{remainingRefundable.toFixed(2)})
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="refundType"
                  checked={refundType === "PARTIAL"}
                  onChange={() => setRefundType("PARTIAL")}
                  className="rounded text-primary focus:ring-primary"
                />
                Partial Refund
              </label>
            </div>
          </div>

          {refundType === "PARTIAL" && (
            <div>
              <Input
                label={`Refund Amount (${order.currency || "USD"})`}
                type="number"
                step="0.01"
                min="0.01"
                max={remainingRefundable}
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          )}

          <div>
            <Input
              label="Reason for Refund (Optional)"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g. Customer returned items / damage"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="restockItems"
              checked={restockItems}
              onChange={(e) => setRestockItems(e.target.checked)}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            <label htmlFor="restockItems" className="text-sm font-medium text-foreground cursor-pointer">
              Restock ordered item inventory
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => setShowRefundModal(false)} disabled={refunding}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleProcessRefund} loading={refunding} disabled={refunding}>
              Confirm Refund
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

