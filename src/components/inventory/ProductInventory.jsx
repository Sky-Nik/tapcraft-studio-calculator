import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus, Download, Trash2, Edit2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import AddItemDialog from "./AddItemDialog";
import EditStockDialog from "./EditStockDialog";

export default function ProductInventory() {
  const [showAdd, setShowAdd] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => base44.entities.Quote.list(),
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product removed");
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, stock_quantity }) => base44.entities.Product.update(id, { stock_quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Stock updated");
    },
  });

  const importFromQuotes = async () => {
    const uniqueParts = {};
    quotes.forEach(q => {
      if (q.part_name && !uniqueParts[q.part_name]) {
        uniqueParts[q.part_name] = {
          name: q.part_name,
          sku: `SKU-${q.part_name.replace(/\s+/g, '-').toUpperCase()}`,
          category: q.category || q.filament_type || "3D Printed",
          cost: q.total_cost || 0,
          price: q.final_price || 0,
          stock_quantity: 0,
          min_stock_level: 5,
          notes: `Imported from quotation`
        };
      }
    });

    const items = Object.values(uniqueParts);
    if (items.length > 0) {
      await base44.entities.Product.bulkCreate(items);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Imported ${items.length} products from quotations`);
    } else {
      toast.error("No unique products found in quotations");
    }
  };

  const syncWithShopify = async () => {
    setSyncing(true);
    try {
      const response = await base44.functions.invoke('syncShopifyProducts');
      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        toast.success(`Synced ${response.data.synced} products (${response.data.created} new, ${response.data.updated} updated)`);
      } else {
        toast.error(response.data.error || 'Sync failed');
      }
    } catch (error) {
      toast.error("Failed to sync with Shopify");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <div className="flex justify-end gap-3 mb-4">
        <Button 
          onClick={syncWithShopify} 
          disabled={syncing}
          variant="outline" 
          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Shopify'}
        </Button>
        <Button onClick={importFromQuotes} variant="outline" className="border-[#1E73FF]/30 text-[#1E73FF] hover:bg-[#1E73FF]/10">
          <Download className="w-4 h-4 mr-2" />
          Import from Quotations
        </Button>
        <Button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-[#1E73FF] to-[#0056D6] hover:from-[#4A9AFF] hover:to-[#1E73FF]">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>
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
            <TableHead className="text-slate-500"></TableHead>
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
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEditingStock(p)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    <AddItemDialog open={showAdd} onClose={() => setShowAdd(false)} onSave={(data) => addMutation.mutate(data)} type="product" />
    <EditStockDialog 
      open={!!editingStock} 
      onClose={() => setEditingStock(null)} 
      onSave={(stock_quantity) => updateStockMutation.mutate({ id: editingStock.id, stock_quantity })} 
      item={editingStock} 
      itemType="product" 
    />
    </>
  );
}