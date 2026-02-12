import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Layers, Edit2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const materialColors = {
  PLA: "from-emerald-500 to-teal-500",
  PETG: "from-blue-500 to-cyan-500",
  ABS: "from-orange-500 to-amber-500",
  Resin: "from-violet-500 to-purple-500",
  TPU: "from-pink-500 to-rose-500",
  Nylon: "from-indigo-500 to-blue-500",
  ASA: "from-yellow-500 to-amber-500",
  PC: "from-red-500 to-orange-500",
};

const inputClass = "bg-slate-800/50 border-slate-700/50 text-white rounded-xl h-10 text-sm";

export default function Filaments() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", material: "PLA", cost_per_kg: 0, color: "", brand: "", stock_kg: 0 });
  const [editId, setEditId] = useState(null);
  const queryClient = useQueryClient();

  const { data: filaments = [] } = useQuery({
    queryKey: ["filaments"],
    queryFn: () => base44.entities.FilamentType.list(),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.FilamentType.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["filaments"] }); setOpen(false); resetForm(); toast.success("Filament added"); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FilamentType.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["filaments"] }); setOpen(false); resetForm(); toast.success("Filament updated"); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.FilamentType.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["filaments"] }); toast.success("Deleted"); },
  });

  const resetForm = () => { setForm({ name: "", material: "PLA", cost_per_kg: 0, color: "", brand: "", stock_kg: 0 }); setEditId(null); };

  const handleEdit = (f) => {
    setForm({ name: f.name, material: f.material, cost_per_kg: f.cost_per_kg || 0, color: f.color || "", brand: f.brand || "", stock_kg: f.stock_kg || 0 });
    setEditId(f.id);
    setOpen(true);
  };

  const handleSubmit = () => {
    if (editId) updateMut.mutate({ id: editId, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{filaments.length} filament{filaments.length !== 1 ? "s" : ""} in inventory</p>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Add Filament
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[hsl(224,20%,10%)] border-slate-700/50 text-white rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">{editId ? "Edit" : "Add"} Filament</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label className="text-xs text-slate-400">Name</Label><Input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-slate-400">Material</Label>
                  <Select value={form.material} onValueChange={(v) => setForm({ ...form, material: v })}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {["PLA", "PETG", "ABS", "Resin", "TPU", "Nylon", "ASA", "PC"].map((m) => <SelectItem key={m} value={m} className="text-slate-200">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs text-slate-400">Cost/kg ($)</Label><Input type="number" className={inputClass} value={form.cost_per_kg || ""} onChange={(e) => setForm({ ...form, cost_per_kg: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-slate-400">Color</Label><Input className={inputClass} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
                <div><Label className="text-xs text-slate-400">Brand</Label><Input className={inputClass} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
              </div>
              <div><Label className="text-xs text-slate-400">Stock (kg)</Label><Input type="number" className={inputClass} value={form.stock_kg || ""} onChange={(e) => setForm({ ...form, stock_kg: parseFloat(e.target.value) || 0 })} /></div>
              <Button onClick={handleSubmit} className="w-full bg-violet-600 hover:bg-violet-500 rounded-xl h-11">{editId ? "Update" : "Add"} Filament</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filaments.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-5 card-hover group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${materialColors[f.material] || "from-slate-500 to-slate-600"} flex items-center justify-center shadow-lg`}>
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-500 hover:text-white hover:bg-white/10" onClick={() => handleEdit(f)}>
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => deleteMut.mutate(f.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <h4 className="text-sm font-semibold text-white">{f.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{f.brand || "—"} · {f.color || "—"}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
              <div>
                <p className="text-[10px] text-slate-600 uppercase">Material</p>
                <p className="text-xs text-slate-300 font-medium">{f.material}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-600 uppercase">$/kg</p>
                <p className="text-xs text-slate-300 font-medium">${(f.cost_per_kg || 0).toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-600 uppercase">Stock</p>
                <p className="text-xs text-slate-300 font-medium">{(f.stock_kg || 0).toFixed(1)} kg</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}