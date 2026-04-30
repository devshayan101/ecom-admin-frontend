"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiGet, apiPatch, getApiError } from "@/lib/api-client";
import type { InventoryItem, ManualAdjustmentRequest } from "@/lib/types";
import Button from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ArrowLeft } from "lucide-react";

export default function InventoryDetailPage() {
  const { variantId } = useParams();
  const router = useRouter();

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await apiGet<InventoryItem>(`/inventory/${variantId}`);
        setItem(data);
      } catch (err: any) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    if (variantId) fetchItem();
  }, [variantId]);

  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !delta || !reason) {
      setError("Please fill in all fields");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const adjustment: ManualAdjustmentRequest = {
        delta: parseInt(delta),
        reason,
      };
      await apiPatch(`/inventory/${variantId}/adjust`, adjustment);
      setSuccess("Inventory adjusted successfully");
      setDelta("");
      setReason("");
      // Refresh the item
      const updated = await apiGet<InventoryItem>(`/inventory/${variantId}`);
      setItem(updated);
    } catch (err: any) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const available = item ? (item.available ?? item.stock - item.reserved) : 0;
  const isLow = item ? available <= item.low_stock_threshold : false;

  if (loading) return <div className="py-12 text-center"><LoadingSpinner /></div>;
  if (!item) return <div className="py-12 text-center text-gray-500">Inventory item not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Detail</h1>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Item Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Product</span>
              <span className="font-medium">{item.product_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-foreground">SKU</span>
              <span className="font-medium">{item.sku}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Stock</span>
              <span className="font-medium">{item.stock}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Reserved</span>
              <span className="font-medium">{item.reserved}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Available</span>
              <span className="font-medium">{available}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Low Stock Threshold</span>
              <span className="font-medium">{item.low_stock_threshold}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-foreground">Status</span>
              <span className={`font-medium ${isLow ? "text-red-600" : "text-green-600"}`}>
                {isLow ? "Low Stock" : "In Stock"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Adjustment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdjustment} className="space-y-4">
              <div>
                <label htmlFor="delta" className="block text-sm font-medium text-foreground mb-1">
                  Delta (use negative for reduction)
                </label>
                <input
                  id="delta"
                  type="number"
                  value={delta}
                  onChange={(e) => setDelta(e.target.value)}
                  placeholder="e.g., 10 or -5"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-foreground mb-1">
                  Reason
                </label>
                <input
                  id="reason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Stock count correction"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>

              <Button type="submit" loading={saving}>
                Apply Adjustment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
