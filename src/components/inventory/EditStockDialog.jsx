import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditStockDialog({ open, onClose, onSave, item, itemType }) {
  const [stockQuantity, setStockQuantity] = useState(item?.stock_quantity || item?.stock_kg || 0);

  const handleSave = () => {
    onSave(stockQuantity);
    onClose();
  };

  const getLabel = () => {
    if (itemType === "filament") return "Stock (kg)";
    return "Stock Quantity";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Stock - {item?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{getLabel()}</Label>
            <Input
              type="number"
              step={itemType === "filament" ? "0.1" : "1"}
              value={stockQuantity}
              onChange={(e) => setStockQuantity(parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-[#1E73FF] to-[#0056D6] hover:from-[#4A9AFF] hover:to-[#1E73FF]">
            Update Stock
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}