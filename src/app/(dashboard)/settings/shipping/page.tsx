"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut, getApiError } from "@/lib/api-client";
import { useAuthContext } from "@/providers/AuthProvider";
import { Card } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { Save, Plus, Trash, RefreshCw, Truck } from "lucide-react";

interface CustomRate {
  _id?: string;
  name: string;
  type: 'flat' | 'price_based' | 'weight_based';
  price: number;
  minLimit?: number;
  maxLimit?: number;
  active: boolean;
}

interface CarrierConfig {
  enabled: boolean;
  sandbox: boolean;
  apiKey: string;
  apiSecret?: string;
  accountId?: string;
}

interface ShippingZone {
  _id?: string;
  name: string;
  countries: string[];
  states: string[];
  rates: CustomRate[];
  active: boolean;
}

export default function ShippingSettingsPage() {
  const { role } = useAuthContext();
  const isReadOnly = role === "viewer";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Global Shipping State
  const [shippingEnabled, setShippingEnabled] = useState(false);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [carriers, setCarriers] = useState<{
    delhivery: CarrierConfig;
    fedex: CarrierConfig;
    dhl: CarrierConfig;
  }>({
    delhivery: { enabled: false, sandbox: true, apiKey: "" },
    fedex: { enabled: false, sandbox: true, apiKey: "" },
    dhl: { enabled: false, sandbox: true, apiKey: "" }
  });

  // Country Config list from General Settings
  const [countriesConfig, setCountriesConfig] = useState<any[]>([]);

  // Zone Modal State
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [currentZoneIndex, setCurrentZoneIndex] = useState<number | null>(null);
  const [zoneForm, setZoneForm] = useState<{
    name: string;
    countries: string[];
    states: string[];
    active: boolean;
  }>({
    name: "",
    countries: [],
    states: [],
    active: true
  });

  // Rate Modal State
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [activeZoneIndexForRates, setActiveZoneIndexForRates] = useState<number | null>(null);
  const [currentRateIndex, setCurrentRateIndex] = useState<number | null>(null);
  const [rateForm, setRateForm] = useState<{
    name: string;
    type: 'flat' | 'price_based' | 'weight_based';
    price: number;
    minLimit: number;
    maxLimit: number;
    active: boolean;
  }>({
    name: "",
    type: "flat",
    price: 0,
    minLimit: 0,
    maxLimit: 0,
    active: true
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await apiGet<any>("/settings");
      if (response) {
        setCountriesConfig(response.taxes?.countriesConfig || []);
        if (response.shipping) {
          setShippingEnabled(response.shipping.enabled || false);
          setZones(response.shipping.zones || []);
          if (response.shipping.carriers) {
            setCarriers({
              delhivery: {
                enabled: response.shipping.carriers.delhivery?.enabled || false,
                sandbox: response.shipping.carriers.delhivery?.sandbox ?? true,
                apiKey: response.shipping.carriers.delhivery?.apiKey || "",
                apiSecret: response.shipping.carriers.delhivery?.apiSecret || "",
                accountId: response.shipping.carriers.delhivery?.accountId || "",
              },
              fedex: {
                enabled: response.shipping.carriers.fedex?.enabled || false,
                sandbox: response.shipping.carriers.fedex?.sandbox ?? true,
                apiKey: response.shipping.carriers.fedex?.apiKey || "",
                apiSecret: response.shipping.carriers.fedex?.apiSecret || "",
                accountId: response.shipping.carriers.fedex?.accountId || "",
              },
              dhl: {
                enabled: response.shipping.carriers.dhl?.enabled || false,
                sandbox: response.shipping.carriers.dhl?.sandbox ?? true,
                apiKey: response.shipping.carriers.dhl?.apiKey || "",
                apiSecret: response.shipping.carriers.dhl?.apiSecret || "",
                accountId: response.shipping.carriers.dhl?.accountId || "",
              }
            });
          }
        }
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
      const payload = {
        enabled: shippingEnabled,
        zones,
        carriers
      };
      await apiPut("/settings/shipping", payload);
      toast.success("Shipping settings updated successfully");
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  // Zone Handlers
  const openZoneModal = (index: number | null = null) => {
    if (index !== null) {
      const zone = zones[index];
      setZoneForm({
        name: zone.name,
        countries: zone.countries || [],
        states: zone.states || [],
        active: zone.active
      });
      setCurrentZoneIndex(index);
    } else {
      setZoneForm({
        name: "",
        countries: [],
        states: [],
        active: true
      });
      setCurrentZoneIndex(null);
    }
    setIsZoneModalOpen(true);
  };

  const handleSaveZone = () => {
    if (!zoneForm.name.trim()) {
      toast.error("Zone name is required.");
      return;
    }

    const updatedZones = [...zones];
    if (currentZoneIndex !== null) {
      updatedZones[currentZoneIndex] = {
        ...updatedZones[currentZoneIndex],
        name: zoneForm.name,
        countries: zoneForm.countries,
        states: zoneForm.states,
        active: zoneForm.active
      };
    } else {
      updatedZones.push({
        name: zoneForm.name,
        countries: zoneForm.countries,
        states: zoneForm.states,
        rates: [],
        active: zoneForm.active
      });
    }

    setZones(updatedZones);
    setIsZoneModalOpen(false);
    toast.success(currentZoneIndex !== null ? "Zone updated" : "Zone created");
  };

  const handleDeleteZone = (index: number) => {
    setZones(zones.filter((_, i) => i !== index));
    toast.success("Zone deleted");
  };

  // Rate Handlers
  const openRateModal = (zoneIndex: number, rateIndex: number | null = null) => {
    setActiveZoneIndexForRates(zoneIndex);
    if (rateIndex !== null) {
      const rate = zones[zoneIndex].rates[rateIndex];
      setRateForm({
        name: rate.name,
        type: rate.type,
        price: rate.price,
        minLimit: rate.minLimit || 0,
        maxLimit: rate.maxLimit || 0,
        active: rate.active
      });
      setCurrentRateIndex(rateIndex);
    } else {
      setRateForm({
        name: "",
        type: "flat",
        price: 0,
        minLimit: 0,
        maxLimit: 0,
        active: true
      });
      setCurrentRateIndex(null);
    }
    setIsRateModalOpen(true);
  };

  const handleSaveRate = () => {
    if (!rateForm.name.trim()) {
      toast.error("Rate name is required.");
      return;
    }
    if (activeZoneIndexForRates === null) return;

    const newRate: CustomRate = {
      name: rateForm.name,
      type: rateForm.type,
      price: rateForm.price,
      minLimit: rateForm.type !== 'flat' ? rateForm.minLimit : undefined,
      maxLimit: rateForm.type !== 'flat' && rateForm.maxLimit > 0 ? rateForm.maxLimit : undefined,
      active: rateForm.active
    };

    const updatedZones = [...zones];
    const zone = updatedZones[activeZoneIndexForRates];

    if (currentRateIndex !== null) {
      zone.rates[currentRateIndex] = newRate;
    } else {
      zone.rates.push(newRate);
    }

    setZones(updatedZones);
    setIsRateModalOpen(false);
    toast.success(currentRateIndex !== null ? "Rate rule updated" : "Rate rule added");
  };

  const handleDeleteRate = (zoneIndex: number, rateIndex: number) => {
    const updatedZones = [...zones];
    updatedZones[zoneIndex].rates = updatedZones[zoneIndex].rates.filter((_, i) => i !== rateIndex);
    setZones(updatedZones);
    toast.success("Rate rule deleted");
  };

  const carrierColumns = (carrierName: keyof typeof carriers) => {
    const carrier = carriers[carrierName];
    return (
      <div className="space-y-4 pt-2">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${carrierName}-enabled`}
              checked={carrier.enabled}
              onChange={(e) => setCarriers(prev => ({
                ...prev,
                [carrierName]: { ...prev[carrierName], enabled: e.target.checked }
              }))}
              disabled={isReadOnly || saving}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor={`${carrierName}-enabled`} className="text-sm font-semibold text-foreground cursor-pointer">
              Enable {carrierName.toUpperCase()}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${carrierName}-sandbox`}
              checked={carrier.sandbox}
              onChange={(e) => setCarriers(prev => ({
                ...prev,
                [carrierName]: { ...prev[carrierName], sandbox: e.target.checked }
              }))}
              disabled={isReadOnly || saving}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor={`${carrierName}-sandbox`} className="text-sm font-semibold text-muted-foreground cursor-pointer">
              Sandbox Mode
            </label>
          </div>
        </div>

        {carrier.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="API Key"
              type="password"
              value={carrier.apiKey}
              onChange={(e) => setCarriers(prev => ({
                ...prev,
                [carrierName]: { ...prev[carrierName], apiKey: e.target.value }
              }))}
              placeholder="Enter API Key"
              disabled={isReadOnly || saving}
            />
            <Input
              label="API Secret / License (Optional)"
              type="password"
              value={carrier.apiSecret || ""}
              onChange={(e) => setCarriers(prev => ({
                ...prev,
                [carrierName]: { ...prev[carrierName], apiSecret: e.target.value }
              }))}
              placeholder="Enter API Secret"
              disabled={isReadOnly || saving}
            />
            <Input
              label="Account ID (Optional)"
              value={carrier.accountId || ""}
              onChange={(e) => setCarriers(prev => ({
                ...prev,
                [carrierName]: { ...prev[carrierName], accountId: e.target.value }
              }))}
              placeholder="Enter Account ID"
              disabled={isReadOnly || saving}
            />
          </div>
        )}
      </div>
    );
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
          <h1 className="text-2xl font-bold text-foreground">Shipping Settings</h1>
          <p className="text-sm text-muted-foreground">Manage shipping zones, custom rules, and carrier credentials</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchSettings} disabled={loading || saving}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
        {/* Global Toggle */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="shippingEnabled"
              checked={shippingEnabled}
              onChange={(e) => setShippingEnabled(e.target.checked)}
              disabled={isReadOnly || saving}
              className="h-4.5 w-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="shippingEnabled" className="text-base font-bold text-foreground cursor-pointer">
              Enable Shipping Services globally
            </label>
          </div>
        </Card>

        {shippingEnabled && (
          <>
            {/* Zones & Rates Manager */}
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Shipping Zones & Custom Rates</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Determine how rates are dynamically served depending on country or state</p>
                </div>
                {!isReadOnly && (
                  <Button type="button" onClick={() => openZoneModal(null)}>
                    <Plus className="h-4 w-4 mr-2" /> Add shipping zone
                  </Button>
                )}
              </div>

              {zones.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg text-muted-foreground text-sm select-none">
                  No shipping zones configured yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {zones.map((zone, zIdx) => (
                    <div key={zIdx} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4 relative group">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 text-base">{zone.name}</h3>
                            <Badge variant={zone.active ? "success" : "default"}>
                              {zone.active ? "Active" : "Disabled"}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            <strong>Countries:</strong> {zone.countries.length > 0 ? zone.countries.join(", ") : "All Countries"}{" | "}
                            <strong>States:</strong> {zone.states.length > 0 ? zone.states.map((s: string) => {
                              if (!s.includes(':')) return s;
                              const [countryCode, stateCode] = s.split(':');
                              const country = countriesConfig.find(c => c.code === countryCode);
                              const state = country?.states?.find((st: any) => st.code === stateCode);
                              return state?.name || stateCode;
                            }).join(", ") : "All States"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="secondary" onClick={() => openZoneModal(zIdx)} disabled={isReadOnly}>
                            Edit Zone
                          </Button>
                          <Button type="button" size="sm" variant="destructive" onClick={() => handleDeleteZone(zIdx)} disabled={isReadOnly}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Custom rates within this zone */}
                      <div className="border-t border-slate-100 pt-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Configured Rates</h4>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => openRateModal(zIdx, null)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-transparent border-0"
                            >
                              <Plus className="h-3 w-3" /> Add Rate Rule
                            </button>
                          )}
                        </div>

                        {zone.rates.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-1">No custom rate rules set. Purchases might fail checkout unless carrier plugins match.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-400">
                                  <th className="py-2">Rate Name</th>
                                  <th className="py-2">Rule Type</th>
                                  <th className="py-2">Conditions</th>
                                  <th className="py-2">Price</th>
                                  <th className="py-2">Status</th>
                                  <th className="py-2 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {zone.rates.map((rate, rIdx) => (
                                  <tr key={rIdx} className="border-b border-slate-100 hover:bg-slate-100/50">
                                    <td className="py-2 font-medium text-slate-700">{rate.name}</td>
                                    <td className="py-2 capitalize">{rate.type.replace('_', ' ')}</td>
                                    <td className="py-2 text-slate-500">
                                      {rate.type === 'flat' && "No conditions (Flat Rate)"}
                                      {rate.type === 'price_based' && `Price: ₹${rate.minLimit || 0} - ${rate.maxLimit ? `₹${rate.maxLimit}` : 'No limit'}`}
                                      {rate.type === 'weight_based' && `Weight: ${rate.minLimit || 0}g - ${rate.maxLimit ? `${rate.maxLimit}g` : 'No limit'}`}
                                    </td>
                                    <td className="py-2 font-bold text-slate-800">₹{rate.price}</td>
                                    <td className="py-2">
                                      <Badge variant={rate.active ? "success" : "default"}>{rate.active ? "Active" : "Disabled"}</Badge>
                                    </td>
                                    <td className="py-2 text-right">
                                      <div className="flex justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => openRateModal(zIdx, rIdx)}
                                          disabled={isReadOnly}
                                          className="text-blue-500 hover:underline cursor-pointer bg-transparent border-0 text-xs"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteRate(zIdx, rIdx)}
                                          disabled={isReadOnly}
                                          className="text-red-500 hover:underline cursor-pointer bg-transparent border-0 text-xs"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Carrier Configurations */}
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Live Courier & Carrier Integrations</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Toggle and input API credentials for live rate queries</p>
              </div>

              <div className="space-y-6 divide-y divide-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-700">Delhivery</h3>
                  {carrierColumns("delhivery")}
                </div>
                <div className="pt-6">
                  <h3 className="text-sm font-bold text-slate-700">FedEx</h3>
                  {carrierColumns("fedex")}
                </div>
                <div className="pt-6">
                  <h3 className="text-sm font-bold text-slate-700">DHL</h3>
                  {carrierColumns("dhl")}
                </div>
              </div>
            </Card>
          </>
        )}

        {!isReadOnly && (
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        )}
      </form>

      {/* Zone Modal */}
      <Modal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        title={currentZoneIndex !== null ? "Edit Shipping Zone" : "Create Shipping Zone"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsZoneModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveZone}>Save Zone</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Zone Name"
            value={zoneForm.name}
            onChange={(e) => setZoneForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Domestic (India), North America"
            required
          />
          {/* Countries selector tags imported from General Settings */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase block">Select Countries (Imported from General Settings)</label>
            {countriesConfig.length === 0 ? (
              <p className="text-xs text-amber-600 font-medium italic">No countries configured in General Settings. Please add countries in General settings first.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {countriesConfig.map((c) => {
                  const isSelected = zoneForm.countries.includes(c.code);
                  return (
                    <button
                      type="button"
                      key={c.code}
                      onClick={() => {
                        setZoneForm(prev => {
                          const nextCountries = isSelected
                            ? prev.countries.filter(name => name !== c.name)
                            : [...prev.countries, c.name];

                          // If unselected, clean up associated states
                          const nextStates = isSelected
                            ? prev.states.filter(sCode => !sCode.startsWith(`${c.code}:`))
                            : prev.states;

                          return { ...prev, countries: nextCountries, states: nextStates };
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                    >
                      {c.name} ({c.code})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* States selector tags imported from General Settings */}
          {countriesConfig.filter(c => zoneForm.countries.includes(c.name) && c.states && c.states.length > 0).length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-500 uppercase block">Select States / Regions</label>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {countriesConfig.filter(c => zoneForm.countries.includes(c.name) && c.states && c.states.length > 0).map(c => (
                  <div key={c.code} className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{c.name} States:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.states.map((s: any) => {
                        const stateKey = `${c.code}:${s.code}`;
                        const isSelected = zoneForm.states.includes(stateKey);
                        return (
                          <button
                            type="button"
                            key={s.code}
                            onClick={() => {
                              setZoneForm(prev => {
                                const nextStates = isSelected
                                  ? prev.states.filter(code => code !== stateKey)
                                  : [...prev.states, stateKey];
                                return { ...prev, states: nextStates };
                              });
                            }}
                            className={`px-2.5 py-1 rounded border text-xs font-medium transition-all cursor-pointer ${isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
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
              id="zoneActive"
              checked={zoneForm.active}
              onChange={(e) => setZoneForm(prev => ({ ...prev, active: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="zoneActive" className="text-sm font-medium text-foreground cursor-pointer">
              Zone is Active
            </label>
          </div>
        </div>
      </Modal>

      {/* Rate Modal */}
      <Modal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        title={currentRateIndex !== null ? "Edit Rate Rule" : "Add Rate Rule"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsRateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRate}>Save Rate</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Rate Name"
            value={rateForm.name}
            onChange={(e) => setRateForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Express Delivery, Standard Free Shipping"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Rate Rule Type</label>
              <select
                value={rateForm.type}
                onChange={(e: any) => setRateForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="flat">Flat Rate</option>
                <option value="price_based">Price Based</option>
                <option value="weight_based">Weight Based (Grams)</option>
              </select>
            </div>
            <Input
              label="Shipping Price (₹)"
              type="number"
              value={rateForm.price}
              onChange={(e) => setRateForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              min={0}
              required
            />
          </div>

          {rateForm.type !== "flat" && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={rateForm.type === "weight_based" ? "Min Weight Limit (grams)" : "Min Price Limit (₹)"}
                type="number"
                value={rateForm.minLimit}
                onChange={(e) => setRateForm(prev => ({ ...prev, minLimit: parseFloat(e.target.value) || 0 }))}
                min={0}
              />
              <Input
                label={rateForm.type === "weight_based" ? "Max Weight Limit (grams)" : "Max Price Limit (₹)"}
                type="number"
                value={rateForm.maxLimit}
                onChange={(e) => setRateForm(prev => ({ ...prev, maxLimit: parseFloat(e.target.value) || 0 }))}
                min={0}
                placeholder="0 = No limit"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="rateActive"
              checked={rateForm.active}
              onChange={(e) => setRateForm(prev => ({ ...prev, active: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="rateActive" className="text-sm font-medium text-foreground cursor-pointer">
              Rate is Active
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
