"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut, getApiError } from "@/lib/api-client";
import { useAuthContext } from "@/providers/AuthProvider";
import type { Settings, GeneralSettings } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/ImageUpload";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { Save, RefreshCw } from "lucide-react";

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($) - United States Dollar" },
  { value: "EUR", label: "EUR (€) - Euro" },
  { value: "GBP", label: "GBP (£) - British Pound" },
  { value: "INR", label: "INR (₹) - Indian Rupee" },
  { value: "CAD", label: "CAD (CA$) - Canadian Dollar" },
  { value: "AUD", label: "AUD (A$) - Australian Dollar" },
];

const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC - Coordinated Universal Time" },
  { value: "America/New_York", label: "EST - America/New_York" },
  { value: "America/Los_Angeles", label: "PST - America/Los_Angeles" },
  { value: "Europe/London", label: "GMT - Europe/London" },
  { value: "Asia/Kolkata", label: "IST - Asia/Kolkata" },
  { value: "Europe/Paris", label: "CET - Europe/Paris" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish (Español)" },
  { value: "fr", label: "French (Français)" },
  { value: "de", label: "German (Deutsch)" },
  { value: "hi", label: "Hindi (हिन्दी)" },
];

export default function GeneralSettingsPage() {
  const { role } = useAuthContext();
  const isReadOnly = role === "viewer";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<GeneralSettings & { reviews?: { auto_publish: boolean } }>({
    storeName: "",
    storeEmail: "",
    storePhone: "",
    logoUrl: "",
    faviconUrl: "",
    currency: "USD",
    timeZone: "UTC",
    language: "en",
    reviews: {
      auto_publish: false,
    },
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await apiGet<Settings>("/settings");
      if (response) {
        setFormData({
          storeName: response.general?.storeName || "",
          storeEmail: response.general?.storeEmail || "",
          storePhone: response.general?.storePhone || "",
          logoUrl: response.general?.logoUrl || "",
          faviconUrl: response.general?.faviconUrl || "",
          currency: response.general?.currency || "USD",
          timeZone: response.general?.timeZone || "UTC",
          language: response.general?.language || "en",
          reviews: {
            auto_publish: response.reviews?.auto_publish || false,
          },
        });
      }
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (url: string) => {
    setFormData((prev) => ({ ...prev, logoUrl: url }));
  };

  const handleFaviconChange = (url: string) => {
    setFormData((prev) => ({ ...prev, faviconUrl: url }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      toast.error("You do not have permission to modify settings.");
      return;
    }

    setSaving(true);
    try {
      await apiPut("/settings/general", formData);
      toast.success("General settings updated successfully");
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">General Settings</h1>
          <p className="text-sm text-muted-foreground">Configure global store details, branding, localization</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchSettings} disabled={loading || saving}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Store Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Store Name"
              id="storeName"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              disabled={isReadOnly || saving}
              required
            />
            <Input
              label="Store Email"
              id="storeEmail"
              name="storeEmail"
              type="email"
              value={formData.storeEmail}
              onChange={handleChange}
              disabled={isReadOnly || saving}
              required
            />
            <Input
              label="Store Phone"
              id="storePhone"
              name="storePhone"
              value={formData.storePhone}
              onChange={handleChange}
              disabled={isReadOnly || saving}
              required
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Logo & Branding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Store Logo</label>
              <p className="text-xs text-muted-foreground mb-2">Upload a logo to display on your storefront and invoices.</p>
              {isReadOnly ? (
                formData.logoUrl ? (
                  <div className="relative w-24 h-24 border border-border rounded-md overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.logoUrl} alt="Store Logo" className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <p className="text-sm italic text-muted-foreground">No logo uploaded</p>
                )
              ) : (
                <ImageUpload
                  value={formData.logoUrl}
                  onChange={handleLogoChange}
                  onRemove={() => handleLogoChange("")}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Store Favicon</label>
              <p className="text-xs text-muted-foreground mb-2">Upload a small icon to display on browser tabs.</p>
              {isReadOnly ? (
                formData.faviconUrl ? (
                  <div className="relative w-12 h-12 border border-border rounded-md overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.faviconUrl} alt="Favicon" className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <p className="text-sm italic text-muted-foreground">No favicon uploaded</p>
                )
              ) : (
                <ImageUpload
                  value={formData.faviconUrl}
                  onChange={handleFaviconChange}
                  onRemove={() => handleFaviconChange("")}
                />
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Localization & Currency</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Default Currency"
              id="currency"
              name="currency"
              value={formData.currency}
              options={CURRENCY_OPTIONS}
              onChange={handleChange}
              disabled={isReadOnly || saving}
            />
            <Select
              label="Time Zone"
              id="timeZone"
              name="timeZone"
              value={formData.timeZone}
              options={TIMEZONE_OPTIONS}
              onChange={handleChange}
              disabled={isReadOnly || saving}
            />
            <Select
              label="Primary Language"
              id="language"
              name="language"
              value={formData.language}
              options={LANGUAGE_OPTIONS}
              onChange={handleChange}
              disabled={isReadOnly || saving}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Reviews Policy</h2>
          <div className="flex items-start gap-3">
            <div className="flex h-5 items-center">
              <input
                id="auto_publish"
                name="auto_publish"
                type="checkbox"
                checked={formData.reviews?.auto_publish || false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData((prev) => ({
                    ...prev,
                    reviews: { auto_publish: checked },
                  }));
                }}
                disabled={isReadOnly || saving}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
            </div>
            <div className="text-sm leading-6">
              <label htmlFor="auto_publish" className="font-semibold text-foreground cursor-pointer">
                Auto-Publish Customer Reviews
              </label>
              <p className="text-xs text-muted-foreground">
                If enabled, submitted reviews will appear on the storefront immediately. If disabled, new reviews remain in a pending state until approved by an administrator.
              </p>
            </div>
          </div>
        </Card>

        {!isReadOnly && (
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
