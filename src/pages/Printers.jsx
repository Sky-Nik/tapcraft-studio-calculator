import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Printer, Edit2, Zap, Clock, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const inputClass = "bg-slate-800/50 border-slate-700/50 text-white rounded-xl h-10 text-sm";

export default function Printers() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", printer_type: "FDM", printer_cost: 0, annual_maintenance: 0,
    estimated_life_years: 5, uptime_percent: 70, power_consumption_watts: 200, build_volume: "",
  });
  const [editId, setEditId] = useState(null);
  const queryClient = useQueryClient();

  const { data: printers = [] } = useQuery({
    queryKey: ["printers"],
    queryFn: () => base44.entities.PrinterProfile.list(),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.PrinterProfile.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["printers"] }); setOpen(false); resetForm(); toast.success("Printer added"); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PrinterProfile.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["printers"] }); setOpen(false); resetForm(); toast.success("Printer updated"); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.PrinterProfile.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["printers"] }); toast.success("Deleted"); },
  });

  const resetForm = () => { setForm({ name: "", printer_type: "FDM", printer_cost: 0, annual_maintenance: 0, estimated_life_years: 5, uptime_percent: 70, power_consumption_watts: 200, build_volume: "" }); setEditId(null); };

  const handleEdit = (p) => {
    setForm({
      name: p.name, printer_type: p.printer_type || "FDM", printer_cost: p.printer_cost || 0,
      annual_maintenance: p.annual_maintenance || 0, estimated_life_years: p.estimated_life_years || 5,
      uptime_percent: p.uptime_percent || 70, power_consumption_watts: p.power_consumption_watts || 200,
      build_volume: p.build_volume || "",
    });
    setEditId(p.id);
    setOpen(true);
  };

  const handleSubmit = () => {
    if (editId) updateMut.mutate({ id: editId, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{printers.length} printer{printers.length !== 1 ? "s" : ""} configured</p>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Add Printer
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[hsl(224,20%,10%)] border-slate-700/50 text-white rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">{editId ? "Edit" : "Add"} Printer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label className="text-xs text-slate-400">Name</Label><Input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-slate-400">Type</Label>
                  <Select value={form.printer_type} onValueChange={(v) => setForm({ ...form, printer_type: v })}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {["FDM", "SLA", "SLS", "DLP"].map((t) => <SelectItem key={t} value={t} className="text-slate-200">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs text-slate-400">Cost ($)</Label><Input type="number" className={inputClass} value={form.printer_cost || ""} onChange={(e) => setForm({ ...form, printer_cost: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-slate-400">Maintenance/yr ($)</Label><Input type="number" className={inputClass} value={form.annual_maintenance || ""} onChange={(e) => setForm({ ...form, annual_maintenance: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label className="text-xs text-slate-400">Life (yrs)</Label><Input type="number" className={inputClass} value={form.estimated_life_years || ""} onChange={(e) => setForm({ ...form, estimated_life_years: parseFloat(e.target.value) || 1 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-slate-400">Uptime %</Label><Input type="number" className={inputClass} value={form.uptime_percent || ""} onChange={(e) => setForm({ ...form, uptime_percent: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label className="text-xs text-slate-400">Power (W)</Label><Input type="number" className={inputClass} value={form.power_consumption_watts || ""} onChange={(e) => setForm({ ...form, power_consumption_watts: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div><Label className="text-xs text-slate-400">Build Volume</Label><Input className={inputClass} placeholder="e.g. 220x220x250mm" value={form.build_volume} onChange={(e) => setForm({ ...form, build_volume: e.target.value })} /></div>
              <Button onClick={handleSubmit} className="w-full bg-violet-600 hover:bg-violet-500 rounded-xl h-11">{editId ? "Update" : "Add"} Printer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {printers.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-5 card-hover group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-500 hover:text-white hover:bg-white/10" onClick={() => handleEdit(p)}><Edit2 className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => deleteMut.mutate(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
            <h4 className="text-sm font-semibold text-white">{p.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{p.printer_type} · {p.build_volume || "—"}</p>
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/[0.04]">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-slate-300">${p.printer_cost || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-500" />
                <span className="text-xs text-slate-300">{p.power_consumption_watts || 0}W</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-slate-300">{p.uptime_percent || 0}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}