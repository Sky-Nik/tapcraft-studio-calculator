import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export default function FilamentInventory() {
  const { data: filaments = [] } = useQuery({
    queryKey: ["filaments"],
    queryFn: () => base44.entities.FilamentType.list(),
  });

  return (
    <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/[0.06] hover:bg-transparent">
            <TableHead className="text-slate-500">Name</TableHead>
            <TableHead className="text-slate-500">Material</TableHead>
            <TableHead className="text-slate-500">Color</TableHead>
            <TableHead className="text-slate-500">Brand</TableHead>
            <TableHead className="text-slate-500">Cost/kg</TableHead>
            <TableHead className="text-slate-500">Stock (kg)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filaments.map((f) => (
            <TableRow key={f.id} className="border-white/[0.04] hover:bg-white/[0.02]">
              <TableCell className="font-medium text-white">{f.name}</TableCell>
              <TableCell><Badge variant="outline">{f.material}</Badge></TableCell>
              <TableCell className="text-slate-400">{f.color || "—"}</TableCell>
              <TableCell className="text-slate-400">{f.brand || "—"}</TableCell>
              <TableCell className="text-slate-400">${f.cost_per_kg?.toFixed(2) || "—"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-white">{f.stock_kg || 0} kg</span>
                  {f.stock_kg < 1 && <AlertCircle className="w-4 h-4 text-amber-500" />}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}