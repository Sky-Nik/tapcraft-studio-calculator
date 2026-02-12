import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export default function PackagingInventory() {
  const { data: packaging = [] } = useQuery({
    queryKey: ["packaging"],
    queryFn: () => base44.entities.PackagingItem.list(),
  });

  return (
    <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/[0.06] hover:bg-transparent">
            <TableHead className="text-slate-500">Name</TableHead>
            <TableHead className="text-slate-500">Type</TableHead>
            <TableHead className="text-slate-500">Unit Cost</TableHead>
            <TableHead className="text-slate-500">Stock Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packaging.map((p) => (
            <TableRow key={p.id} className="border-white/[0.04] hover:bg-white/[0.02]">
              <TableCell className="font-medium text-white">{p.name}</TableCell>
              <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
              <TableCell className="text-slate-400">${p.unit_cost?.toFixed(2) || "—"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-white">{p.stock_quantity || 0}</span>
                  {p.stock_quantity < 10 && <AlertCircle className="w-4 h-4 text-amber-500" />}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}