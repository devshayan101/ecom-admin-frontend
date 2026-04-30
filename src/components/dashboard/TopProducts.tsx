"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api-client";
import type { TopProduct } from "@/lib/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getApiError } from "@/lib/api-client";

export default function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const data = await apiGet<{ items: TopProduct[] }>("/dashboard/top-products");
        setProducts(data.items || []);
      } catch (err: any) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchTopProducts();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600 text-sm p-4">{error}</div>;

  return (
    <div className="bg-background rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 border-b border-border">
        <h3 className="text-lg font-medium text-foreground">Top Products by Revenue</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Units Sold
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-muted-foreground">
                  No data available
                </td>
              </tr>
            ) : (
              products.map((product, idx) => (
                <tr key={product.product_id} className={idx % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground text-right">
                    {product.units_sold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground text-right">
                    ${product.revenue?.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
