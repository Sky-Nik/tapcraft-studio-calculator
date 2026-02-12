import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AddItemDialog({ open, onClose, onSave, type }) {
  const [formData, setFormData] = useState({});

  const handleSave = () => {
    onSave(formData);
    setFormData({});
    onClose();
  };

  const renderForm = () => {
    switch (type) {
      case "filament":
        return (
          <>
            <div><Label>Name</Label><Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div><Label>Material</Label>
              <Select value={formData.material} onValueChange={(v) => setFormData({ ...formData, material: v })}>
                <SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLA">PLA</SelectItem>
                  <SelectItem value="PETG">PETG</SelectItem>
                  <SelectItem value="ABS">ABS</SelectItem>
                  <SelectItem value="Resin">Resin</SelectItem>
                  <SelectItem value="TPU">TPU</SelectItem>
                  <SelectItem value="Nylon">Nylon</SelectItem>
                  <SelectItem value="ASA">ASA</SelectItem>
                  <SelectItem value="PC">PC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Color</Label><Input value={formData.color || ""} onChange={(e) => setFormData({ ...formData, color: e.target.value })} /></div>
            <div><Label>Brand</Label><Input value={formData.brand || ""} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} /></div>
            <div><Label>Cost per kg ($)</Label><Input type="number" step="0.01" value={formData.cost_per_kg || ""} onChange={(e) => setFormData({ ...formData, cost_per_kg: parseFloat(e.target.value) })} /></div>
            <div><Label>Stock (kg)</Label><Input type="number" step="0.1" value={formData.stock_kg || ""} onChange={(e) => setFormData({ ...formData, stock_kg: parseFloat(e.target.value) })} /></div>
          </>
        );
      case "hardware":
        return (
          <>
            <div><Label>Name</Label><Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div><Label>Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bolts">Bolts</SelectItem>
                  <SelectItem value="nuts">Nuts</SelectItem>
                  <SelectItem value="inserts">Inserts</SelectItem>
                  <SelectItem value="bearings">Bearings</SelectItem>
                  <SelectItem value="magnets">Magnets</SelectItem>
                  <SelectItem value="springs">Springs</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Unit Cost ($)</Label><Input type="number" step="0.01" value={formData.unit_cost || ""} onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) })} /></div>
            <div><Label>Stock Quantity</Label><Input type="number" value={formData.stock_quantity || ""} onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })} /></div>
          </>
        );
      case "packaging":
        return (
          <>
            <div><Label>Name</Label><Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div><Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="bag">Bag</SelectItem>
                  <SelectItem value="wrap">Wrap</SelectItem>
                  <SelectItem value="padding">Padding</SelectItem>
                  <SelectItem value="label">Label</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Unit Cost ($)</Label><Input type="number" step="0.01" value={formData.unit_cost || ""} onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) })} /></div>
            <div><Label>Stock Quantity</Label><Input type="number" value={formData.stock_quantity || ""} onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })} /></div>
          </>
        );
      case "product":
        return (
          <>
            <div><Label>Name</Label><Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div><Label>SKU</Label><Input value={formData.sku || ""} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} /></div>
            <div><Label>Category</Label><Input value={formData.category || ""} onChange={(e) => setFormData({ ...formData, category: e.target.value })} /></div>
            <div><Label>Cost ($)</Label><Input type="number" step="0.01" value={formData.cost || ""} onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })} /></div>
            <div><Label>Price ($)</Label><Input type="number" step="0.01" value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} /></div>
            <div><Label>Stock Quantity</Label><Input type="number" value={formData.stock_quantity || ""} onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })} /></div>
            <div><Label>Min Stock Level</Label><Input type="number" value={formData.min_stock_level || ""} onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) })} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={formData.notes || ""} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {renderForm()}
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-[#1E73FF] to-[#0056D6] hover:from-[#4A9AFF] hover:to-[#1E73FF]">
            Add Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}