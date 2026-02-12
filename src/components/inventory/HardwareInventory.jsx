import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AddItemDialog from "./AddItemDialog";

export default function HardwareInventory() {
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();

  const { data: hardware = [] } = useQuery({
    queryKey: ["hardware"],
    queryFn: () => base44.entities.HardwareItem.list(),
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.HardwareItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hardware"] });
      toast.success("Hardware added");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HardwareItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hardware"] });
      toast.success("Hardware removed");
    },
  });

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-[#1E73FF] to-[#0056D6] hover:from-[#4A9AFF] hover:to-[#1E73FF]">
          <Plus className="w-4 h-4 mr-2" />
          Add Hardware
        </Button>
      </div>
      <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] overflow-hidden">
        <Table>
        <TableHeader>
          <TableRow className="border-white/[0.06] hover:bg-transparent">
            <TableHead className="text-slate-500">Name</TableHead>
            <TableHead className="text-slate-500">Category</TableHead>
            <TableHead className="text-slate-500">Custom Type</TableHead>
            <TableHead className="text-slate-500">Unit Cost</TableHead>
            <TableHead className="text-slate-500">Stock Quantity</TableHead>
            <TableHead className="text-slate-500"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hardware.map((h) => (
            <TableRow key={h.id} className="border-white/[0.04] hover:bg-white/[0.02]">
              <TableCell className="font-medium text-white">{h.name}</TableCell>
              <TableCell><Badge variant="outline">{h.category}</Badge></TableCell>
              <TableCell className="text-slate-400">{h.custom_type || "—"}</TableCell>
              <TableCell className="text-slate-400">${h.unit_cost?.toFixed(2) || "—"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-white">{h.stock_quantity || 0}</span>
                  {h.stock_quantity < 10 && <AlertCircle className="w-4 h-4 text-amber-500" />}
                </div>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(h.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    <AddItemDialog open={showAdd} onClose={() => setShowAdd(false)} onSave={(data) => addMutation.mutate(data)} type="hardware" />
    </>
  );
}