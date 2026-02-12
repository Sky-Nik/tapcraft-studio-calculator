import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import AddItemDialog from "./AddItemDialog";

export default function FilamentInventory() {
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();

  const { data: filaments = [] } = useQuery({
    queryKey: ["filaments"],
    queryFn: () => base44.entities.FilamentType.list(),
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.FilamentType.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filaments"] });
      toast.success("Filament added");
    },
  });

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-[#1E73FF] to-[#0056D6] hover:from-[#4A9AFF] hover:to-[#1E73FF]">
          <Plus className="w-4 h-4 mr-2" />
          Add Filament
        </Button>
      </div>
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
    <AddItemDialog open={showAdd} onClose={() => setShowAdd(false)} onSave={(data) => addMutation.mutate(data)} type="filament" />
    </>
  );
}