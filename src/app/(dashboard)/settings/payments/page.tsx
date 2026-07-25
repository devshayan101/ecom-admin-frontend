"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut, getApiError } from "@/lib/api-client";
import { useAuthContext } from "@/providers/AuthProvider";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { Save, RefreshCw, Eye, EyeOff, ShieldCheck, HelpCircle, CheckCircle, AlertCircle, Copy, Check } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { Settings } from "@/lib/types";

export default function PaymentSettingsPage() {
  const { role } = useAuthContext();
  const isReadOnly = role === "viewer";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"razorpay" | "stripe" | "cod">("razorpay");

  // Show/Hide Secrets State
  const [showRzpSecret, setShowRzpSecret] = useState(false);
  const [showRzpWebhookSecret, setShowRzpWebhookSecret] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showStripeWebhookSecret, setShowStripeWebhookSecret] = useState(false);

  // Clipboard Copied State
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Settings State
  const [payments, setPayments] = useState({
    razorpay: { enabled: false, sandbox: true, keyId: "", secretKey: "", webhookSecret: "" },
    stripe: { enabled: false, sandbox: true, keyId: "", secretKey: "", webhookSecret: "" },
    cod: { enabled: false, minOrderAmount: 0, maxOrderAmount: 0, instructions: "" }
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = (await apiGet("/settings")) as Settings;
      if (data && data.payments) {
        setPayments({
          razorpay: {
            enabled: data.payments.razorpay?.enabled ?? false,
            sandbox: data.payments.razorpay?.sandbox ?? true,
            keyId: data.payments.razorpay?.keyId ?? "",
            secretKey: data.payments.razorpay?.secretKey ?? "",
            webhookSecret: data.payments.razorpay?.webhookSecret ?? ""
          },
          stripe: {
            enabled: data.payments.stripe?.enabled ?? false,
            sandbox: data.payments.stripe?.sandbox ?? true,
            keyId: data.payments.stripe?.keyId ?? "",
            secretKey: data.payments.stripe?.secretKey ?? "",
            webhookSecret: data.payments.stripe?.webhookSecret ?? ""
          },
          cod: {
            enabled: data.payments.cod?.enabled ?? false,
            minOrderAmount: data.payments.cod?.minOrderAmount ?? 0,
            maxOrderAmount: data.payments.cod?.maxOrderAmount ?? 0,
            instructions: data.payments.cod?.instructions ?? ""
          }
        });
      }
    } catch (err) {
      toast.error(getApiError(err) || "Failed to load payment settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (isReadOnly) return;
    if (payments.cod.maxOrderAmount > 0 && payments.cod.minOrderAmount > payments.cod.maxOrderAmount) {
      toast.error("Min order amount cannot exceed max order amount");
      return;
    }
    try {
      setSaving(true);
      await apiPut("/settings/payments", payments);
      toast.success("Payment settings updated successfully");
    } catch (err) {
      toast.error(getApiError(err) || "Failed to update payment settings");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(id);
      setTimeout(() => setCopiedUrl(null), 2000);
      toast.success("Webhook URL copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const getWebhookUrl = (gateway: string) => {
    // Dynamic fallback URL
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const apiBase = origin.replace(":3000", ":3001");
    return `${apiBase}/webhooks/${gateway}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payment Gateways</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure domestic and international payment gateways and order checkout settings.
          </p>
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={fetchSettings} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Navigation Sidebar & Overview */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Settings Navigation</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {[
                { id: "razorpay", label: "Razorpay (Domestic)", desc: "UPI, Cards, Wallets in India", enabled: payments.razorpay.enabled },
                { id: "stripe", label: "Stripe (International)", desc: "Cards & global local payments", enabled: payments.stripe.enabled },
                { id: "cod", label: "Cash on Delivery", desc: "Pay at delivery destination", enabled: payments.cod.enabled }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between text-left p-3 rounded-lg transition-all duration-200 ${activeTab === tab.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-accent hover:text-foreground text-muted-foreground"
                    }`}
                >
                  <div>
                    <span className="text-sm block">{tab.label}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">{tab.desc}</span>
                  </div>
                  <Badge variant={tab.enabled ? "success" : "default"} className="text-[10px] uppercase px-1.5 py-0.5">
                    {tab.enabled ? "Active" : "Inactive"}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Active Configuration Summary */}
          <Card className="bg-gradient-to-br from-emerald-50/50 to-blue-50/50 dark:from-slate-900/50 dark:to-slate-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Checkout Routing Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-foreground">India (INR)</strong>: Routed automatically through <strong>Razorpay Modal</strong> overlay.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-foreground">International</strong>: Routed securely through <strong>Stripe Elements</strong> card flow.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-foreground">COD Options</strong>: Constrained only to domestic India shipments.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Form Configuration Panel */}
        <div className="lg:col-span-8">
          {/* RAZORPAY CONFIG */}
          {activeTab === "razorpay" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-normal">Razorpay Configuration</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Configure API keys for processing UPI and cards inside India.</p>
                </div>
                {/* Custom Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    checked={payments.razorpay.enabled}
                    onChange={(e) => setPayments({
                      ...payments,
                      razorpay: { ...payments.razorpay, enabled: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Sandbox vs Live toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border/50">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Sandbox / Test Mode</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Use test API keys to validate checkout processes.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={isReadOnly}
                      checked={payments.razorpay.sandbox}
                      onChange={(e) => setPayments({
                        ...payments,
                        razorpay: { ...payments.razorpay, sandbox: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Key ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Razorpay Key ID</label>
                  <Input
                    disabled={isReadOnly}
                    placeholder="rzp_test_..."
                    value={payments.razorpay.keyId}
                    onChange={(e) => setPayments({
                      ...payments,
                      razorpay: { ...payments.razorpay, keyId: e.target.value }
                    })}
                  />
                </div>

                {/* Key Secret */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Razorpay Key Secret</label>
                  <div className="relative">
                    <Input
                      type={showRzpSecret ? "text" : "password"}
                      disabled={isReadOnly}
                      placeholder={payments.razorpay.secretKey ? "••••••••••••••••" : "Enter key secret"}
                      value={payments.razorpay.secretKey}
                      onChange={(e) => setPayments({
                        ...payments,
                        razorpay: { ...payments.razorpay, secretKey: e.target.value }
                      })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRzpSecret(!showRzpSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showRzpSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Webhook Secret */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Webhook Secret</label>
                  <div className="relative">
                    <Input
                      type={showRzpWebhookSecret ? "text" : "password"}
                      disabled={isReadOnly}
                      placeholder={payments.razorpay.webhookSecret ? "••••••••••••••••" : "Enter webhook secret"}
                      value={payments.razorpay.webhookSecret}
                      onChange={(e) => setPayments({
                        ...payments,
                        razorpay: { ...payments.razorpay, webhookSecret: e.target.value }
                      })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRzpWebhookSecret(!showRzpWebhookSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showRzpWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Webhook helper link info */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-border/60 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Webhook Configuration helper
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Set up this Webhook URL inside your Razorpay Dashboard settings to automatically capture paid orders asynchronously:
                  </p>
                  <div className="flex items-center gap-2 bg-background p-2.5 rounded-lg border border-border/80">
                    <code className="text-xs text-primary flex-1 select-all break-all">
                      {getWebhookUrl("razorpay")}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(getWebhookUrl("razorpay"), "rzp")}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {copiedUrl === "rzp" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <span className="text-[9px] text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" /> Supported event triggers: <strong>payment.captured</strong> and <strong>order.paid</strong>
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STRIPE CONFIG */}
          {activeTab === "stripe" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-normal">Stripe Configuration</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Configure global cards, Apple Pay, Google Pay settings.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    checked={payments.stripe.enabled}
                    onChange={(e) => setPayments({
                      ...payments,
                      stripe: { ...payments.stripe, enabled: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Sandbox vs Live toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border/50">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Test Mode</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Use Stripe test mode key pairs.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={isReadOnly}
                      checked={payments.stripe.sandbox}
                      onChange={(e) => setPayments({
                        ...payments,
                        stripe: { ...payments.stripe, sandbox: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Publishable Key */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Stripe Publishable Key</label>
                  <Input
                    disabled={isReadOnly}
                    placeholder="pk_test_..."
                    value={payments.stripe.keyId}
                    onChange={(e) => setPayments({
                      ...payments,
                      stripe: { ...payments.stripe, keyId: e.target.value }
                    })}
                  />
                </div>

                {/* Secret Key */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Stripe Secret Key</label>
                  <div className="relative">
                    <Input
                      type={showStripeSecret ? "text" : "password"}
                      disabled={isReadOnly}
                      placeholder={payments.stripe.secretKey ? "••••••••••••••••" : "Enter secret key"}
                      value={payments.stripe.secretKey}
                      onChange={(e) => setPayments({
                        ...payments,
                        stripe: { ...payments.stripe, secretKey: e.target.value }
                      })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripeSecret(!showStripeSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showStripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Webhook Secret */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Stripe Webhook Signing Secret</label>
                  <div className="relative">
                    <Input
                      type={showStripeWebhookSecret ? "text" : "password"}
                      disabled={isReadOnly}
                      placeholder={payments.stripe.webhookSecret ? "••••••••••••••••" : "whsec_..."}
                      value={payments.stripe.webhookSecret}
                      onChange={(e) => setPayments({
                        ...payments,
                        stripe: { ...payments.stripe, webhookSecret: e.target.value }
                      })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripeWebhookSecret(!showStripeWebhookSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showStripeWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Webhook helper link info */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-border/60 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Webhook Configuration helper
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Set up this Webhook endpoint inside your Stripe Dashboard settings to automatically fulfill orders paid via cards globally:
                  </p>
                  <div className="flex items-center gap-2 bg-background p-2.5 rounded-lg border border-border/80">
                    <code className="text-xs text-primary flex-1 select-all break-all">
                      {getWebhookUrl("stripe")}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(getWebhookUrl("stripe"), "stripe")}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {copiedUrl === "stripe" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <span className="text-[9px] text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" /> Supported event triggers: <strong>payment_intent.succeeded</strong>
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CASH ON DELIVERY CONFIG */}
          {activeTab === "cod" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-normal">Cash on Delivery (COD)</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Configure Cash on Delivery options and constraints.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    checked={payments.cod.enabled}
                    onChange={(e) => setPayments({
                      ...payments,
                      cod: { ...payments.cod, enabled: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Min Limit */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Min Order Amount Limit (INR)</label>
                    <Input
                      type="number"
                      min={0}
                      disabled={isReadOnly}
                      placeholder="0"
                      value={payments.cod.minOrderAmount || ""}
                      onChange={(e) => setPayments({
                        ...payments,
                        cod: { ...payments.cod, minOrderAmount: Number(e.target.value) }
                      })}
                    />
                  </div>

                  {/* Max Limit */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Max Order Amount Limit (INR)</label>
                    <Input
                      type="number"
                      disabled={isReadOnly}
                      placeholder="No limit"
                      value={payments.cod.maxOrderAmount || ""}
                      onChange={(e) => setPayments({
                        ...payments,
                        cod: { ...payments.cod, maxOrderAmount: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>

                {/* Instructions Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Checkout / Order Success Instructions</label>
                  <textarea
                    rows={4}
                    disabled={isReadOnly}
                    placeholder="Enter instructions to show the customer on checkout page or order success page..."
                    value={payments.cod.instructions}
                    onChange={(e) => setPayments({
                      ...payments,
                      cod: { ...payments.cod, instructions: e.target.value }
                    })}
                    className="w-full text-sm rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
