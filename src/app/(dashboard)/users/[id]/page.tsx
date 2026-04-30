"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiGet, apiPatch, apiDelete, getApiError } from "@/lib/api-client";
import type { AdminUser } from "@/lib/types";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { ChevronLeft, Save, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function ManageUserPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    role: "viewer" as "superadmin" | "manager" | "viewer",
    is_active: true,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiGet<AdminUser>(`/users/${id}`);
        setUser(data);
        setFormData({
          role: data.role,
          is_active: data.is_active,
        });
      } catch (err) {
        toast.error(getApiError(err));
        router.push("/users");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiPatch<AdminUser>(`/users/${id}`, formData);
      setUser(updated);
      toast.success("User updated successfully");
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    try {
      await apiDelete(`/users/${id}`);
      toast.success("User deactivated");
      router.push("/users");
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-accent rounded-md"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Permissions & Role
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
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
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Account Status</p>
                <p className="text-sm text-muted-foreground">
                  {formData.is_active ? "This user can access the dashboard" : "This user is currently blocked"}
                </p>
              </div>
              <Badge variant={formData.is_active ? "success" : "destructive"}>
                {formData.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">
            Deactivating a user will prevent them from logging in. This action is reversible by an admin.
          </p>
          <Button variant="destructive" onClick={handleDeactivate}>
            <Trash2 className="h-4 w-4 mr-2" />
            Deactivate User
          </Button>
        </div>
      </div>
    </div>
  );
}
