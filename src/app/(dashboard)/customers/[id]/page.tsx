"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPut, apiDelete, getApiError } from "@/lib/api-client";
import type { Customer, Address } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function CustomerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { hasPermission } = useAuthContext();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await apiGet<Customer>(`/customers/${id}`);
        setCustomer(data);
      } catch (err: any) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCustomer();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setError("");
    setSaving(true);

    try {
      await apiPut(`/customers/${id}`, {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      });
      router.push("/customers");
    } catch (err: any) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await apiDelete(`/customers/${id}`);
      router.push("/customers");
    } catch (err: any) {
      setError(getApiError(err));
    }
  };

  const updateAddress = (field: string, value: string) => {
    if (!customer) return;
    const currentAddress: Address = customer.address || {
      recipient_name: customer.name,
      street: "",
      city: "",
      state: "",
      postcode: "",
      country: "",
    };
    setCustomer({
      ...customer,
      address: {
        ...currentAddress,
        [field]: value,
      },
    });
  };

  if (loading) return <div className="py-12 text-center"><LoadingSpinner /></div>;
  if (!customer) return <div className="py-12 text-center">Customer not found</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/customers" className="text-gray-500 hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Customer Profile</h1>
        </div>
        {hasPermission("customers:write") && (
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{customer.name}</h2>
            <Badge variant={customer.is_active ? "success" : "destructive"}>
              {customer.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">{customer.email}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Name"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={customer.phone || ""}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            />

            {customer.address && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold pt-4">Address</h3>
                <Input
                  label="Street"
                  value={customer.address.street || ""}
                  onChange={(e) => updateAddress("street", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={customer.address.city || ""}
                    onChange={(e) => updateAddress("city", e.target.value)}
                  />
                  <Input
                    label="State"
                    value={customer.address.state || ""}
                    onChange={(e) => updateAddress("state", e.target.value)}
                  />
                </div>
              </div>
            )}

            {hasPermission("customers:write") && (
              <Button type="submit" loading={saving}>Save Changes</Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
