"use client";

import { useEffect, useState, useRef } from "react";
import { apiGet, apiPost, apiPut, apiDelete, getApiError } from "@/lib/api-client";
import type { Coupon } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { Plus, Trash, Edit, Search, Tag, Percent, DollarSign, RefreshCw } from "lucide-react";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const requestCountRef = useRef(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discount_value: "",
    min_order_amount: "",
    max_discount_amount: "",
    start_date: "",
    end_date: "",
    usage_limit: "",
    is_active: true,
  });

  const fetchCoupons = async () => {
    const requestId = ++requestCountRef.current;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      const res = await apiGet<{ items: Coupon[] }>(`/coupons?${queryParams.toString()}`);
      if (requestId === requestCountRef.current) {
        setCoupons(res.items || []);
      }
    } catch (err) {
      if (requestId === requestCountRef.current) {
        toast.error(getApiError(err));
      }
    } finally {
      if (requestId === requestCountRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: String(coupon.discount_value),
        min_order_amount: String(coupon.min_order_amount || 0),
        max_discount_amount: coupon.max_discount_amount ? String(coupon.max_discount_amount) : "",
        start_date: coupon.start_date ? new Date(coupon.start_date).toISOString().slice(0, 16) : "",
        end_date: coupon.end_date ? new Date(coupon.end_date).toISOString().slice(0, 16) : "",
        usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : "",
        is_active: coupon.is_active,
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: "",
        discount_type: "PERCENTAGE",
        discount_value: "",
        min_order_amount: "0",
        max_discount_amount: "",
        start_date: "",
        end_date: "",
        usage_limit: "",
        is_active: true,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    if (!formData.discount_value || Number(formData.discount_value) <= 0) {
      toast.error("Valid discount value is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        min_order_amount: Number(formData.min_order_amount) || 0,
        max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        is_active: formData.is_active,
      };

      if (editingCoupon) {
        await apiPut(`/coupons/${editingCoupon._id}`, payload);
        toast.success("Coupon updated successfully");
      } else {
        await apiPost("/coupons", payload);
        toast.success("Coupon created successfully");
      }

      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await apiDelete(`/coupons/${id}`);
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await apiPut(`/coupons/${coupon._id}`, { is_active: !coupon.is_active });
      toast.success(`Coupon ${!coupon.is_active ? "activated" : "deactivated"}`);
      fetchCoupons();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const columns = [
    {
      key: "code",
      title: "Code",
      render: (c: Coupon) => <span className="font-mono font-bold text-foreground">{c.code}</span>,
    },
    {
      key: "discount",
      title: "Discount",
      render: (c: Coupon) =>
        c.discount_type === "PERCENTAGE" ? (
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <Percent className="h-3.5 w-3.5" /> {c.discount_value}% OFF
            {c.max_discount_amount ? ` (Max $${c.max_discount_amount})` : ""}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
            <DollarSign className="h-3.5 w-3.5" /> ${c.discount_value} OFF
          </span>
        ),
    },
    {
      key: "min_order_amount",
      title: "Min. Order",
      render: (c: Coupon) => <span className="font-medium text-muted-foreground">${c.min_order_amount || 0}</span>,
    },
    {
      key: "usage",
      title: "Usage",
      render: (c: Coupon) => (
        <span className="text-muted-foreground">
          {c.used_count} {c.usage_limit ? `/ ${c.usage_limit}` : "uses"}
        </span>
      ),
    },
    {
      key: "validity",
      title: "Validity",
      render: (c: Coupon) => {
        const isExpired = c.end_date && new Date() > new Date(c.end_date);
        return c.end_date ? (
          <span className={isExpired ? "text-destructive font-semibold" : "text-muted-foreground"}>
            Expires: {new Date(c.end_date).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-muted-foreground">No Expiry</span>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      render: (c: Coupon) => {
        const isExpired = c.end_date && new Date() > new Date(c.end_date);
        return (
          <button onClick={() => handleToggleActive(c)}>
            {isExpired ? (
              <Badge variant="default">Expired</Badge>
            ) : c.is_active ? (
              <Badge variant="success">Active</Badge>
            ) : (
              <Badge variant="default">Inactive</Badge>
            )}
          </button>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      className: "text-right",
      render: (c: Coupon) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(c)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(c._id)} className="text-destructive hover:text-destructive">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" /> Discounts & Coupons
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage promotional codes, minimum order rules, and usage limits.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search coupon code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchCoupons()}
              className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={fetchCoupons} className="flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        <Table
          data={coupons}
          columns={columns}
          keyExtractor={(c) => c._id}
          loading={loading}
          emptyMessage="No coupon codes found. Click 'Create Coupon' to add one."
        />
      </Card>

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCoupon ? "Edit Coupon" : "Create New Coupon"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Coupon Code *</label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. WELCOME10"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Value *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                placeholder={formData.discount_type === "PERCENTAGE" ? "10" : "15.00"}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Order Amount ($)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Discount Amount ($)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.max_discount_amount}
                onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                placeholder="Optional max cap"
                disabled={formData.discount_type !== "PERCENTAGE"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date / Expiry</label>
              <Input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-sm font-medium mb-1">Usage Limit</label>
              <Input
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                placeholder="Unlimited if blank"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-primary rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                Active Coupon
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
