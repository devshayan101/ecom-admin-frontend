"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost, getApiError } from "@/lib/api-client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ChevronLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer" as "superadmin" | "manager" | "viewer",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost("/users", formData);
      toast.success("User created successfully");
      router.push("/users");
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-accent rounded-md"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Create New Admin User</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          <Input
            label="Full Name"
            id="name"
            placeholder="Enter user's name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="email@example.com"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="Create a strong password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Role</label>
            <select
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            >
              <option value="viewer">Viewer</option>
              <option value="manager">Manager</option>
              <option value="superadmin">Super Admin</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Roles define what actions the user can perform.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : "Create User"}
          </Button>
        </div>
      </form>
    </div>
  );
}
