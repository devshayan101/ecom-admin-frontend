"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut, getApiError } from "@/lib/api-client";
import { useAuthContext } from "@/providers/AuthProvider";
import type { Settings, TaxSettings, TaxRule, CountryConfig, StateConfig } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { Save, Plus, Trash, RefreshCw } from "lucide-react";

const PREDEFINED_STATES: Record<string, Array<{ name: string; code: string }>> = {
  in: [
    { name: "Andhra Pradesh", code: "AP" },
    { name: "Arunachal Pradesh", code: "AR" },
    { name: "Assam", code: "AS" },
    { name: "Bihar", code: "BR" },
    { name: "Chhattisgarh", code: "CG" },
    { name: "Goa", code: "GA" },
    { name: "Gujarat", code: "GJ" },
    { name: "Haryana", code: "HR" },
    { name: "Himachal Pradesh", code: "HP" },
    { name: "Jharkhand", code: "JH" },
    { name: "Karnataka", code: "KA" },
    { name: "Kerala", code: "KL" },
    { name: "Madhya Pradesh", code: "MP" },
    { name: "Maharashtra", code: "MH" },
    { name: "Manipur", code: "MN" },
    { name: "Meghalaya", code: "ML" },
    { name: "Mizoram", code: "MZ" },
    { name: "Nagaland", code: "NL" },
    { name: "Odisha", code: "OD" },
    { name: "Punjab", code: "PB" },
    { name: "Rajasthan", code: "RJ" },
    { name: "Sikkim", code: "SK" },
    { name: "Tamil Nadu", code: "TN" },
    { name: "Telangana", code: "TG" },
    { name: "Tripura", code: "TR" },
    { name: "Uttar Pradesh", code: "UP" },
    { name: "Uttarakhand", code: "UK" },
    { name: "West Bengal", code: "WB" },
    { name: "Delhi", code: "DL" }
  ],
  us: [
    { name: "Alabama", code: "AL" },
    { name: "Alaska", code: "AK" },
    { name: "Arizona", code: "AZ" },
    { name: "Arkansas", code: "AR" },
    { name: "California", code: "CA" },
    { name: "Colorado", code: "CO" },
    { name: "Connecticut", code: "CT" },
    { name: "Delaware", code: "DE" },
    { name: "Florida", code: "FL" },
    { name: "Georgia", code: "GA" },
    { name: "Hawaii", code: "HI" },
    { name: "Idaho", code: "ID" },
    { name: "Illinois", code: "IL" },
    { name: "Indiana", code: "IN" },
    { name: "Iowa", code: "IA" },
    { name: "Kansas", code: "KS" },
    { name: "Kentucky", code: "KY" },
    { name: "Louisiana", code: "LA" },
    { name: "Maine", code: "ME" },
    { name: "Maryland", code: "MD" },
    { name: "Massachusetts", code: "MA" },
    { name: "Michigan", code: "MI" },
    { name: "Minnesota", code: "MN" },
    { name: "Mississippi", code: "MS" },
    { name: "Missouri", code: "MO" },
    { name: "Montana", code: "MT" },
    { name: "Nebraska", code: "NE" },
    { name: "Nevada", code: "NV" },
    { name: "New Hampshire", code: "NH" },
    { name: "New Jersey", code: "NJ" },
    { name: "New Mexico", code: "NM" },
    { name: "New York", code: "NY" },
    { name: "North Carolina", code: "NC" },
    { name: "North Dakota", code: "ND" },
    { name: "Ohio", code: "OH" },
    { name: "Oklahoma", code: "OK" },
    { name: "Oregon", code: "OR" },
    { name: "Pennsylvania", code: "PA" },
    { name: "Rhode Island", code: "RI" },
    { name: "South Carolina", code: "SC" },
    { name: "South Dakota", code: "SD" },
    { name: "Tennessee", code: "TN" },
    { name: "Texas", code: "TX" },
    { name: "Utah", code: "UT" },
    { name: "Vermont", code: "VT" },
    { name: "Virginia", code: "VA" },
    { name: "Washington", code: "WA" },
    { name: "West Virginia", code: "WV" },
    { name: "Wisconsin", code: "WI" },
    { name: "Wyoming", code: "WY" }
  ]
};

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
  const [countriesConfig, setCountriesConfig] = useState<CountryConfig[]>([]);

  const getStatesForCountryCode = (countryCode?: string) => {
    if (!countryCode) return [];
    const matchedCountry = countriesConfig.find(
      (c) => c.code.toLowerCase() === countryCode.toLowerCase()
    );
    if (matchedCountry) {
      return matchedCountry.states;
    }
    return PREDEFINED_STATES[countryCode.toLowerCase()] || [];
  };

  // Add rule modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]); // Format "COUNTRY_CODE:STATE_CODE"
  const [newRule, setNewRule] = useState<{
    name: string;
    rate: number;
    active: boolean;
  }>({
    name: "",
    rate: 0,
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
        setCountriesConfig(response.taxes.countriesConfig || []);
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
        countriesConfig,
      };
      await apiPut("/settings/taxes", payload);
      toast.success("Tax settings updated successfully");
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const openAddRuleModal = () => {
    setSelectedCountries([]);
    setSelectedStates([]);
    setNewRule({
      name: "",
      rate: 0,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleAddRule = () => {
    if (!newRule.name.trim() || newRule.rate < 0) {
      toast.error("Please enter a valid rule name and non-negative rate.");
      return;
    }

    if (selectedCountries.length === 0) {
      toast.error("Please select at least one country.");
      return;
    }

    const createdRules: TaxRule[] = [];

    selectedCountries.forEach((countryName) => {
      const countryObj = countriesConfig.find((c) => c.name === countryName);
      const countryCode = countryObj?.code || "";

      // Check if specific states were selected for this country
      const countryStateKeys = selectedStates.filter((sKey) => sKey.startsWith(`${countryCode}:`));

      const isDuplicate = (stateCode: string) =>
        taxRules.some((r) => r.countryCode === countryCode && (r.stateCode || "") === stateCode) ||
        createdRules.some((r) => r.countryCode === countryCode && (r.stateCode || "") === stateCode);

      if (countryStateKeys.length > 0) {
        countryStateKeys.forEach((sKey) => {
          const sCode = sKey.split(":")[1];
          if (isDuplicate(sCode)) return;
          const stateObj = countryObj?.states?.find((s) => s.code === sCode);
          createdRules.push({
            name: newRule.name,
            country: countryName,
            countryCode,
            state: stateObj?.name || "",
            stateCode: sCode,
            rate: newRule.rate,
            active: newRule.active,
          });
        });
      } else {
        // All states for this country
        if (isDuplicate("")) return;
        createdRules.push({
          name: newRule.name,
          country: countryName,
          countryCode,
          state: "",
          stateCode: "",
          rate: newRule.rate,
          active: newRule.active,
        });
      }
    });

    setTaxRules((prev) => [...prev, ...createdRules]);
    setIsModalOpen(false);
    toast.success(`Added ${createdRules.length} tax rule(s).`);
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
      render: (rule: TaxRule) => (
        <span className="text-foreground">
          {rule.country} <span className="text-xs text-muted-foreground">({rule.countryCode})</span>
        </span>
      ),
    },
    {
      key: "state",
      title: "State/Region",
      render: (rule: TaxRule) => (
        <span className="text-muted-foreground">
          {rule.state ? `${rule.state} (${rule.stateCode || rule.state})` : "All"}
        </span>
      ),
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
              <Button type="button" onClick={openAddRuleModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            )}
          </div>

          <Table
            data={taxRules}
            columns={columns}
            keyExtractor={(rule, index) => rule._id || `${rule.name}-${rule.country}-${rule.countryCode}-${rule.state || "all"}-${rule.rate}-${index}`}
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

          {/* Countries selector chips imported from General Settings */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase block">Select Countries (Imported from General Settings)</label>
            {countriesConfig.length === 0 ? (
              <p className="text-xs text-amber-600 font-medium italic">No countries configured in General Settings. Please add countries in General settings first.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {countriesConfig.map((c) => {
                  const isSelected = selectedCountries.includes(c.name);
                  return (
                    <button
                      type="button"
                      key={c.code}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCountries((prev) => prev.filter((name) => name !== c.name));
                          setSelectedStates((prev) => prev.filter((sKey) => !sKey.startsWith(`${c.code}:`)));
                        } else {
                          setSelectedCountries((prev) => [...prev, c.name]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${isSelected
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                    >
                      {c.name} ({c.code})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* States selector chips imported from General Settings */}
          {countriesConfig.filter((c) => selectedCountries.includes(c.name) && c.states && c.states.length > 0).length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-500 uppercase block">Select States / Regions (Optional - Leave unselected for All States)</label>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {countriesConfig
                  .filter((c) => selectedCountries.includes(c.name) && c.states && c.states.length > 0)
                  .map((c) => (
                    <div key={c.code} className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{c.name} States:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.states.map((s: StateConfig) => {
                          const stateKey = `${c.code}:${s.code}`;
                          const isSelected = selectedStates.includes(stateKey);
                          return (
                            <button
                              type="button"
                              key={s.code}
                              onClick={() => {
                                setSelectedStates((prev) =>
                                  isSelected
                                    ? prev.filter((key) => key !== stateKey)
                                    : [...prev, stateKey]
                                );
                              }}
                              className={`px-2.5 py-1 rounded border text-xs font-medium transition-all cursor-pointer ${isSelected
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                }`}
                            >
                              {s.name} ({s.code})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

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
