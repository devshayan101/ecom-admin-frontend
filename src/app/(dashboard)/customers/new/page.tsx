"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost, getApiError } from "@/lib/api-client";
import type { CreateCustomerRequest } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";

export default function NewCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: CreateCustomerRequest = {
        name,
        email,
        phone,
        address: { street, city, state, postcode, country },
      };
      await apiPost("/customers", payload);
      router.push("/customers");
    } catch (err: any) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/customers" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Customer</h1>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Input label="Name" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Phone" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

            <h3 className="text-lg font-semibold pt-4">Address</h3>
            <Input label="Street" id="street" value={street} onChange={(e) => setStreet(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" id="city" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input label="State" id="state" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Postcode" id="postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
              <Input label="Country" id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>

            <Button type="submit" loading={loading} className="mt-4">Create Customer</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
