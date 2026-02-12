import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, TrendingUp, DollarSign, Package, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function Sales() {
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSale, setNewSale] = useState({
    customer_name: "",
    customer_email: "",
    product_name: "",
    quantity: 1,
    unit_price: 0,
    cost: 0,
    sale_date: new Date().toISOString().split('T')[0],
    status: "completed",
    payment_method: "",
    notes: ""
  });

  const queryClient = useQueryClient();

  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: () => base44.entities.Sale.list("-sale_date"),
  });

  const addMutation = useMutation({
    mutationFn: (data) => {
      const total_amount = data.unit_price * data.quantity;
      const profit = total_amount - (data.cost * data.quantity);
      return base44.entities.Sale.create({ ...data, total_amount, profit });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setShowAddDialog(false);
      setNewSale({
        customer_name: "",
        customer_email: "",
        product_name: "",
        quantity: 1,
        unit_price: 0,
        cost: 0,
        sale_date: new Date().toISOString().split('T')[0],
        status: "completed",
        payment_method: "",
        notes: ""
      });
      toast.success("Sale added");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Sale.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Sale deleted");
    },
  });

  const filteredSales = sales.filter(s => 
    s.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const completedSales = sales.filter(s => s.status === "completed");
  const totalRevenue = completedSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalProfit = completedSales.reduce((sum, s) => sum + (s.profit || 0), 0);

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
    refunded: "bg-red-500/20 text-red-400 border-red-500/30"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Sales</h1>
          <p className="text-slate-400 mt-1">Track and manage your sales</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-[#1E73FF] to-[#0056D6] hover:from-[#4A9AFF] hover:to-[#1E73FF]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sale
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[hsl(224,20%,9%)] rounded-xl p-6 border border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Sales</p>
              <p className="text-2xl font-bold text-white mt-1">{completedSales.length}</p>
            </div>
            <Package className="w-8 h-8 text-[#1E73FF]" />
          </div>
        </div>
        <div className="bg-[hsl(224,20%,9%)] rounded-xl p-6 border border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">${totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-[hsl(224,20%,9%)] rounded-xl p-6 border border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Profit</p>
              <p className="text-2xl font-bold text-white mt-1">${totalProfit.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search sales..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[hsl(224,20%,9%)] border-white/[0.06]"
        />
      </div>

      <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.06] hover:bg-transparent">
              <TableHead className="text-slate-500">Date</TableHead>
              <TableHead className="text-slate-500">Customer</TableHead>
              <TableHead className="text-slate-500">Product</TableHead>
              <TableHead className="text-slate-500">Qty</TableHead>
              <TableHead className="text-slate-500">Amount</TableHead>
              <TableHead className="text-slate-500">Profit</TableHead>
              <TableHead className="text-slate-500">Status</TableHead>
              <TableHead className="text-slate-500"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.map((sale) => (
              <TableRow key={sale.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                <TableCell className="text-slate-400">
                  {sale.sale_date ? new Date(sale.sale_date).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-white">{sale.customer_name || "—"}</TableCell>
                <TableCell className="text-white font-medium">{sale.product_name}</TableCell>
                <TableCell className="text-slate-400">{sale.quantity}</TableCell>
                <TableCell className="text-green-400">${sale.total_amount?.toFixed(2)}</TableCell>
                <TableCell className="text-emerald-400">${sale.profit?.toFixed(2) || "0.00"}</TableCell>
                <TableCell>
                  <Badge className={statusColors[sale.status]}>{sale.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(sale.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[hsl(224,20%,9%)] border-white/[0.06] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="gradient-text">Add New Sale</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Customer Name</Label>
              <Input
                value={newSale.customer_name}
                onChange={(e) => setNewSale({ ...newSale, customer_name: e.target.value })}
                className="bg-[hsl(224,15%,14%)] border-white/[0.06]"
              />
            </div>
            <div>
              <Label>Customer Email</Label>
              <Input
                type="email"
                value={newSale.customer_email}
                onChange={(e) => setNewSale({ ...newSale, customer_email: e.target.value })}
                className="bg-[hsl(224,15%,14%)] border-white/[0.06]"
              />
            </div>
            <div>
              <Label>Product Name *</Label>
              <Input
                value={newSale.product_name}
                onChange={(e) => setNewSale({ ...newSale, product_name: e.target.value })}
                className="bg-[hsl(224,15%,14%)] border-white/[0.06]"
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={newSale.quantity}
                onChange={(e) => setNewSale({ ...newSale, quantity: parseInt(e.target.value) })}
                className="bg-[hsl(224,15%,14%)] border-white/[0.06]"
              />
            </div>
            <div>
              <Label>Unit Price *</Label>
              <Input
                type="number"
                step="0.01"
                value={newSale.unit_price}
                onChange={(e) => setNewSale({ ...newSale, unit_price: parseFloat(e.target.value) })}
                className="bg-[hsl(224,15%,14%)] border-white/[0.06]"
              />
            </div>
            <div>
              <Label>Cost per Unit</Label>
              <Input
                type="number"
                step="0.01"
                value={newSale.cost}
                onChange={(e) => setNewSale({ ...newSale, cost: parseFloat(e.target.value) })}
                className="bg-[hsl(224,15%,14%)] border-white/[0.06]"
              />
            </div>
            <div>
              <Label>Sale Date</Label>
              <Input
                type="date"
                value={newSale.sale_date}
                onChange={(e) => setNewSale({ ...newSale, sale_date: e.target.value })}
                className="bg-[hsl(224,15%,14%)] border-white/[0.06]"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={newSale.status} onValueChange={(v) => setNewSale({ ...newSale, status: v })}>
                <SelectTrigger className="bg-[hsl(224,15%,14%)] border-white/[0.06]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(224,20%,9%)] border-white/[0.06] text-white">
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Payment Method</Label>
              <Input
                value={newSale.payment_method}
                onChange={(e) => setNewSale({ ...newSale, payment_method: e.target.value })}
                className="bg-[hsl(224,15%,14%)] border-white/[0.06]"
                placeholder="e.g., Cash, Card, PayPal"
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Input
                value={newSale.notes}
                onChange={(e) => setNewSale({ ...newSale, notes: e.target.value })}
                className="bg-[hsl(224,15%,14%)] border-white/[0.06]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button
              onClick={() => addMutation.mutate(newSale)}
              disabled={!newSale.product_name || !newSale.unit_price}
              className="bg-gradient-to-r from-[#1E73FF] to-[#0056D6]"
            >
              Add Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}