import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export default function ProductInventory() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list(),
  });

  return (
    <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/[0.06] hover:bg-transparent">
            <TableHead className="text-slate-500">Name</TableHead>
            <TableHead className="text-slate-500">SKU</TableHead>
            <TableHead className="text-slate-500">Category</TableHead>
            <TableHead className="text-slate-500">Cost</TableHead>
            <TableHead className="text-slate-500">Price</TableHead>
            <TableHead className="text-slate-500">Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id} className="border-white/[0.04] hover:bg-white/[0.02]">
              <TableCell className="font-medium text-white">{p.name}</TableCell>
              <TableCell className="text-slate-400">{p.sku || "—"}</TableCell>
              <TableCell><Badge variant="outline">{p.category || "—"}</Badge></TableCell>
              <TableCell className="text-slate-400">${p.cost?.toFixed(2) || "—"}</TableCell>
              <TableCell className="text-slate-400">${p.price?.toFixed(2) || "—"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-white">{p.stock_quantity || 0}</span>
                  {p.min_stock_level && p.stock_quantity < p.min_stock_level && (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}