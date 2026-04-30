"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { BarChart2, Boxes } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Reports</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/reports/sales" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Sales Report</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                View sales revenue, order counts, and top products by date range.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/inventory" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Boxes className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Inventory Report</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                View low stock items and inventory summary.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
