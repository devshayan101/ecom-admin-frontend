"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut, getApiError } from "@/lib/api-client";
import { useAuthContext } from "@/providers/AuthProvider";
import type { Settings, TaxSettings, TaxRule } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { Save, Plus, Trash, RefreshCw } from "lucide-react";

export default function TaxSettingsPage() {
  const { role } = useAuthContext();
  const isReadOnly = role === "viewer";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Tax state
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstin, setGstin] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [inclusive, setInclusive] = useState(false);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);

  // Add rule modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState<Omit<TaxRule, "_id">>({
    country: "",
    state: "",
    rate: 0,
    name: "",
    active: true,
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await apiGet<Settings>("/settings");
      if (response && response.taxes) {
        setGstEnabled(response.taxes.gstVatSettings?.enabled || false);
        setGstin(response.taxes.gstVatSettings?.gstin || "");
        setVatNumber(response.taxes.gstVatSettings?.vatNumber || "");
        setInclusive(response.taxes.gstVatSettings?.inclusive || false);
        setTaxRules(response.taxes.taxRules || []);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      toast.error("You do not have permission to modify settings.");
      return;
    }

    setSaving(true);
    try {
      const payload: TaxSettings = {
        taxRules,
        gstVatSettings: {
          enabled: gstEnabled,
          gstin: gstEnabled ? gstin : undefined,
          vatNumber: gstEnabled ? vatNumber : undefined,
          inclusive,
        },
      };
      await apiPut("/settings/taxes", payload);
      toast.success("Tax settings updated successfully");
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAddRule = () => {
    if (!newRule.country || !newRule.name || newRule.rate < 0) {
      toast.error("Please enter a valid country, rule name, and rate.");
      return;
    }
    setTaxRules((prev) => [...prev, { ...newRule }]);
    setIsModalOpen(false);
    setNewRule({
      country: "",
      state: "",
      rate: 0,
      name: "",
      active: true,
    });
  };

  const handleDeleteRule = (rule: TaxRule) => {
    setTaxRules((prev) => prev.filter((r) => r !== rule));
  };

  const toggleRuleActive = (rule: TaxRule) => {
    setTaxRules((prev) =>
      prev.map((r) => (r === rule ? { ...r, active: !r.active } : r))
    );
  };

  const columns = [
    {
      key: "name",
      title: "Tax Name",
      render: (rule: TaxRule) => <span className="font-medium text-foreground">{rule.name}</span>,
    },
    {
      key: "country",
      title: "Country",
      render: (rule: TaxRule) => <span className="text-foreground">{rule.country}</span>,
    },
    {
      key: "state",
      title: "State/Region",
      render: (rule: TaxRule) => <span className="text-muted-foreground">{rule.state || "All"}</span>,
    },
    {
      key: "rate",
      title: "Rate (%)",
      render: (rule: TaxRule) => <span className="text-foreground font-semibold">{rule.rate}%</span>,
    },
    {
      key: "active",
      title: "Status",
      render: (rule: TaxRule) => (
        <button
          type="button"
          disabled={isReadOnly}
          onClick={() => toggleRuleActive(rule)}
          className="cursor-pointer focus:outline-none"
        >
          <Badge variant={rule.active ? "success" : "default"}>
            {rule.active ? "Active" : "Inactive"}
          </Badge>
        </button>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (rule: TaxRule) => (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={isReadOnly}
          onClick={() => handleDeleteRule(rule)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      ),
    },
  ];

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
          <h1 className="text-2xl font-bold text-foreground">Tax Settings</h1>
          <p className="text-sm text-muted-foreground">Configure GST/VAT registrations and regional tax rules</p>
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
          <h2 className="text-lg font-semibold text-foreground mb-4">GST / VAT Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="gstEnabled"
                checked={gstEnabled}
                onChange={(e) => setGstEnabled(e.target.checked)}
                disabled={isReadOnly || saving}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="gstEnabled" className="text-sm font-medium text-foreground cursor-pointer">
                Enable GST / VAT Taxes
              </label>
            </div>

            {gstEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <Input
                  label="GSTIN (India GST)"
                  id="gstin"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  disabled={isReadOnly || saving}
                  placeholder="e.g. 22AAAAA1111A1Z1"
                />
                <Input
                  label="VAT Number (Europe/UK)"
                  id="vatNumber"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  disabled={isReadOnly || saving}
                  placeholder="e.g. GB123456789"
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="inclusive"
                checked={inclusive}
                onChange={(e) => setInclusive(e.target.checked)}
                disabled={isReadOnly || saving}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="inclusive" className="text-sm font-medium text-foreground cursor-pointer">
                Product prices already include tax (Tax Inclusive Pricing)
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Tax Rules</h2>
            {!isReadOnly && (
              <Button type="button" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            )}
          </div>

          <Table
            data={taxRules}
            columns={columns}
            keyExtractor={(rule) => `${rule.name}-${rule.country}-${rule.state || "all"}`}
            loading={false}
            emptyMessage="No custom tax rules added yet."
          />
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

      {/* Add Tax Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Tax Rule"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRule}>
              Add Rule
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Tax Rule Name"
            id="ruleName"
            value={newRule.name}
            onChange={(e) => setNewRule((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Standard VAT, State Sales Tax"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Country"
              id="ruleCountry"
              value={newRule.country}
              onChange={(e) => setNewRule((prev) => ({ ...prev, country: e.target.value }))}
              placeholder="e.g. US, IN, GB"
              required
            />
            <Input
              label="State / Region (Optional)"
              id="ruleState"
              value={newRule.state}
              onChange={(e) => setNewRule((prev) => ({ ...prev, state: e.target.value }))}
              placeholder="e.g. NY, CA, KA"
            />
          </div>
          <Input
            label="Tax Rate (%)"
            id="ruleRate"
            type="number"
            step="0.01"
            value={newRule.rate || ""}
            onChange={(e) => setNewRule((prev) => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
            placeholder="e.g. 18.5"
            required
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="ruleActive"
              checked={newRule.active}
              onChange={(e) => setNewRule((prev) => ({ ...prev, active: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="ruleActive" className="text-sm font-medium text-foreground cursor-pointer">
              Rule is Active
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
