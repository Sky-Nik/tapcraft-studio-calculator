import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, HardDrive } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const inputClass = "bg-slate-800/50 border-slate-700/50 text-white rounded-xl h-10 text-sm";

export default function Hardware() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "bolts", unit_cost: 0, stock_quantity: 0 });
  const [editId, setEditId] = useState(null);
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["hardware"],
    queryFn: () => base44.entities.HardwareItem.list(),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.HardwareItem.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["hardware"] }); setOpen(false); resetForm(); toast.success("Item added"); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.HardwareItem.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["hardware"] }); setOpen(false); resetForm(); toast.success("Item updated"); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.HardwareItem.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["hardware"] }); toast.success("Deleted"); },
  });

  const resetForm = () => { setForm({ name: "", category: "bolts", custom_type: "", unit_cost: 0, stock_quantity: 0 }); setEditId(null); };

  const handleEdit = (item) => {
    setForm({ name: item.name, category: item.category || "bolts", custom_type: item.custom_type || "", unit_cost: item.unit_cost || 0, stock_quantity: item.stock_quantity || 0 });
    setEditId(item.id);
    setOpen(true);
  };

  const handleSubmit = () => {
    if (editId) updateMut.mutate({ id: editId, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{items.length} item{items.length !== 1 ? "s" : ""} in stock</p>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[hsl(224,20%,10%)] border-slate-700/50 text-white rounded-2xl max-w-sm">
            <DialogHeader><DialogTitle className="text-white">{editId ? "Edit" : "Add"} Hardware</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label className="text-xs text-slate-400">Name</Label><Input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label className="text-xs text-slate-400">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {["bolts", "nuts", "inserts", "bearings", "magnets", "springs", "other"].map((c) => <SelectItem key={c} value={c} className="text-slate-200 capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs text-slate-400">Custom Type</Label><Input placeholder="e.g., M3 x 10mm" className={inputClass} value={form.custom_type} onChange={(e) => setForm({ ...form, custom_type: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-slate-400">Unit Cost ($)</Label><Input type="number" step="0.01" className={inputClass} value={form.unit_cost || ""} onChange={(e) => setForm({ ...form, unit_cost: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label className="text-xs text-slate-400">Stock Qty</Label><Input type="number" className={inputClass} value={form.stock_quantity || ""} onChange={(e) => setForm({ ...form, stock_quantity: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <Button onClick={handleSubmit} className="w-full bg-violet-600 hover:bg-violet-500 rounded-xl h-11">{editId ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.06] hover:bg-transparent">
              <TableHead className="text-slate-500 text-xs">Name</TableHead>
              <TableHead className="text-slate-500 text-xs">Category</TableHead>
              <TableHead className="text-slate-500 text-xs">Custom Type</TableHead>
              <TableHead className="text-slate-500 text-xs">Unit Cost</TableHead>
              <TableHead className="text-slate-500 text-xs">Stock</TableHead>
              <TableHead className="text-slate-500 text-xs w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                <TableCell className="text-slate-200 font-medium">{item.name}</TableCell>
                <TableCell className="text-slate-400 text-sm capitalize">{item.category}</TableCell>
                <TableCell className="text-slate-400 text-sm">{item.custom_type || "—"}</TableCell>
                <TableCell className="text-slate-300">${(item.unit_cost || 0).toFixed(2)}</TableCell>
                <TableCell className="text-slate-400">{item.stock_quantity || 0}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-500 hover:text-white" onClick={() => handleEdit(item)}><Edit2 className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-500 hover:text-red-400" onClick={() => deleteMut.mutate(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-10"><HardDrive className="w-6 h-6 text-slate-700 mx-auto mb-2" /><p className="text-xs text-slate-600">No hardware items</p></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}