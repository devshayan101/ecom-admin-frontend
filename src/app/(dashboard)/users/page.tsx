"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet, getApiError } from "@/lib/api-client";
import type { AdminUser } from "@/lib/types";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { UserPlus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiGet<{ items: AdminUser[] }>("/users");
      setUsers(response.items);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    {
      key: "name",
      title: "Name",
      render: (u: AdminUser) => (
        <div>
          <p className="font-medium text-foreground">{u.name}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      title: "Role",
      render: (u: AdminUser) => (
        <Badge variant="secondary" className="capitalize">
          {u.role}
        </Badge>
      ),
    },
    {
      key: "is_active",
      title: "Status",
      render: (u: AdminUser) => (
        <Badge variant={u.is_active ? "success" : "destructive"}>
          {u.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (u: AdminUser) => (
        <button
          onClick={() => router.push(`/users/${u._id}`)}
          className="text-sm text-primary hover:text-blue-500"
        >
          Manage
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Users</h1>
          <p className="text-sm text-muted-foreground">Manage dashboard access and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/users/new">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              New User
            </Button>
          </Link>
        </div>
      </div>

      <Table
        data={users}
        columns={columns}
        keyExtractor={(u) => u._id}
        loading={loading}
        emptyMessage="No admin users found."
      />
    </div>
  );
}
