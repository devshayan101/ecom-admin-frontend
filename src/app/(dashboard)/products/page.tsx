"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet, apiGetPaginated } from "@/lib/api-client";
import type { Category, Product } from "@/lib/types";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { PRODUCT_STATUS_LABELS } from "@/lib/constants";
import { ChevronDown, ChevronRight, Plus, Search, Folder, FolderX } from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, prodsRes] = await Promise.all([
        apiGet<Category[] | { items: Category[] }>("/categories"),
        apiGetPaginated<Product>("/products", { limit: 500 }),
      ]);

      const fetchedCategories = Array.isArray(catsRes)
        ? catsRes
        : catsRes && Array.isArray((catsRes as any).items)
        ? (catsRes as any).items
        : [];

      setCategories(fetchedCategories);
      setProducts(prodsRes.items || []);
    } catch (err) {
      console.error("Failed to load products or categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const collapseAll = () => {
    const nextState: Record<string, boolean> = { uncategorized: true };
    categories.forEach((cat) => {
      nextState[cat._id] = true;
    });
    setCollapsedCategories(nextState);
  };

  const expandAll = () => {
    setCollapsedCategories({});
  };

  // Filter products by status & search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCat = (p.category_name || "").toLowerCase().includes(q);
        const matchesSku = p.variants?.some((v) => v.sku.toLowerCase().includes(q));
        if (!matchesName && !matchesCat && !matchesSku) return false;
      }
      return true;
    });
  }, [products, search, statusFilter]);

  // Group products by category
  const groupedData = useMemo(() => {
    const categoryMap: Record<string, Product[]> = {};

    categories.forEach((cat) => {
      categoryMap[cat._id] = [];
    });

    const uncategorizedProducts: Product[] = [];

    filteredProducts.forEach((p) => {
      if (p.category_id && categoryMap[p.category_id]) {
        categoryMap[p.category_id].push(p);
      } else {
        uncategorizedProducts.push(p);
      }
    });

    return { categoryMap, uncategorizedProducts };
  }, [categories, filteredProducts]);

  const columns = [
    {
      key: "name",
      title: "Product",
      render: (p: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md border border-border overflow-hidden bg-muted/50 flex-shrink-0">
            {p.images && p.images[0] ? (
              <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
            ) : p.variants?.[0]?.image ? (
              <img src={p.variants[0].image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[10px] text-gray-400">No img</span>
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.variants?.[0]?.sku || p._id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (p: Product) => (
        <Badge variant={p.status === "active" ? "success" : p.status === "draft" ? "warning" : "outline"}>
          {PRODUCT_STATUS_LABELS[p.status] || p.status}
        </Badge>
      ),
    },
    {
      key: "variants",
      title: "Variants",
      render: (p: Product) => <span>{p.variants?.length || 0}</span>,
    },
    {
      key: "actions",
      title: "Actions",
      render: (p: Product) => (
        <button
          onClick={() => router.push(`/products/${p._id}`)}
          className="text-sm text-primary hover:text-blue-500 font-medium"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">Products grouped by category</p>
        </div>
        <Link href="/products/new">
          <Button><Plus className="h-4 w-4 mr-2" /> New Product</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end justify-between bg-card p-4 rounded-lg border border-border">
        <div className="flex gap-4 flex-1 items-end w-full sm:w-auto">
          <div className="flex-1">
            <Input
              label="Search"
              id="search"
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select
              label="Status"
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "All Statuses" },
                { value: "active", label: "Active" },
                { value: "draft", label: "Draft" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </div>
          {(search || statusFilter) && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
            >
              Reset
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="secondary" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading products and categories...</div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => {
            const catProducts = groupedData.categoryMap[cat._id] || [];
            const isCollapsed = collapsedCategories[cat._id];

            return (
              <div key={cat._id} className="border border-border rounded-lg bg-card overflow-hidden">
                <div
                  onClick={() => toggleCategory(cat._id)}
                  className="flex items-center justify-between p-4 bg-muted/40 cursor-pointer hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isCollapsed ? (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                    <Folder className="h-5 w-5 text-primary" />
                    <div>
                      <span className="font-semibold text-foreground">{cat.name}</span>
                      {cat.slug && (
                        <span className="text-xs text-muted-foreground ml-2">({cat.slug})</span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline">{catProducts.length} products</Badge>
                </div>

                {!isCollapsed && (
                  <div className="p-4 border-t border-border">
                    <Table
                      data={catProducts}
                      columns={columns}
                      keyExtractor={(p) => p._id}
                      loading={false}
                      emptyMessage="No products in this category."
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Uncategorized Section */}
          {(groupedData.uncategorizedProducts.length > 0 || categories.length === 0) && (
            <div className="border border-border rounded-lg bg-card overflow-hidden">
              <div
                onClick={() => toggleCategory("uncategorized")}
                className="flex items-center justify-between p-4 bg-muted/40 cursor-pointer hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {collapsedCategories["uncategorized"] ? (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <FolderX className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold text-foreground">Uncategorized</span>
                </div>
                <Badge variant="outline">
                  {groupedData.uncategorizedProducts.length} products
                </Badge>
              </div>

              {!collapsedCategories["uncategorized"] && (
                <div className="p-4 border-t border-border">
                  <Table
                    data={groupedData.uncategorizedProducts}
                    columns={columns}
                    keyExtractor={(p) => p._id}
                    loading={false}
                    emptyMessage="No uncategorized products."
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

