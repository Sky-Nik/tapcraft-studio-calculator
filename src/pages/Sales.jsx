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
import { Plus, Search, TrendingUp, DollarSign, Package, Trash2, Calendar, Edit2, FileText, Eye, Download } from "lucide-react";
import { toast } from "sonner";

export default function Sales() {
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
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
      if (editingSale) {
        return base44.entities.Sale.update(editingSale.id, { ...data, total_amount, profit });
      }
      return base44.entities.Sale.create({ ...data, total_amount, profit });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setShowAddDialog(false);
      setEditingSale(null);
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
      toast.success(editingSale ? "Sale updated" : "Sale added");
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

  const { data: companySettings } = useQuery({
    queryKey: ["companySettings"],
    queryFn: async () => {
      const settings = await base44.entities.CompanySettings.list();
      return settings[0];
    },
  });

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setNewSale({
      customer_name: sale.customer_name || "",
      customer_email: sale.customer_email || "",
      product_name: sale.product_name || "",
      quantity: sale.quantity || 1,
      unit_price: sale.unit_price || 0,
      cost: sale.cost || 0,
      sale_date: sale.sale_date || new Date().toISOString().split('T')[0],
      status: sale.status || "completed",
      payment_method: sale.payment_method || "",
      notes: sale.notes || ""
    });
    setShowAddDialog(true);
  };

  const generateInvoice = async (sale) => {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const invoiceContent = document.createElement('div');
    invoiceContent.style.width = '800px';
    invoiceContent.style.padding = '40px';
    invoiceContent.style.backgroundColor = 'white';
    invoiceContent.style.fontFamily = 'Arial, sans-serif';

    invoiceContent.innerHTML = `
      <div style="margin-bottom: 30px;">
        ${companySettings?.logo_url ? `<img src="${companySettings.logo_url}" style="height: 80px; margin-bottom: 20px;" />` : ''}
        <h1 style="font-size: 32px; color: #1E73FF; margin: 0;">INVOICE</h1>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px;">
        <div>
          <h3 style="font-size: 14px; color: #666; margin: 0 0 10px 0;">FROM</h3>
          <p style="margin: 0; font-size: 16px; font-weight: bold;">${companySettings?.company_name || 'Company Name'}</p>
          <p style="margin: 5px 0; font-size: 14px; color: #666;">${companySettings?.address || ''}</p>
          <p style="margin: 5px 0; font-size: 14px; color: #666;">${companySettings?.phone || ''}</p>
          <p style="margin: 5px 0; font-size: 14px; color: #666;">${companySettings?.email || ''}</p>
        </div>
        <div>
          <h3 style="font-size: 14px; color: #666; margin: 0 0 10px 0;">TO</h3>
          <p style="margin: 0; font-size: 16px; font-weight: bold;">${sale.customer_name || 'Customer'}</p>
          <p style="margin: 5px 0; font-size: 14px; color: #666;">${sale.customer_email || ''}</p>
          <p style="margin: 15px 0 5px 0; font-size: 14px;"><strong>Date:</strong> ${sale.sale_date ? new Date(sale.sale_date).toLocaleDateString() : ''}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Invoice #:</strong> ${sale.id.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${sale.product_name}</td>
            <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">${sale.quantity}</td>
            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">$${sale.unit_price?.toFixed(2)}</td>
            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">$${sale.total_amount?.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 30px;">
        <p style="font-size: 24px; font-weight: bold; margin: 0; color: #1E73FF;">Total: $${sale.total_amount?.toFixed(2)}</p>
        <p style="font-size: 14px; margin: 10px 0 0 0; color: #666;">Status: ${sale.status}</p>
        ${sale.payment_method ? `<p style="font-size: 14px; margin: 5px 0 0 0; color: #666;">Payment Method: ${sale.payment_method}</p>` : ''}
      </div>

      ${sale.notes ? `<div style="margin-top: 40px; padding: 15px; background: #f9f9f9; border-left: 3px solid #1E73FF;"><p style="margin: 0; font-size: 14px; color: #666;"><strong>Notes:</strong> ${sale.notes}</p></div>` : ''}

      ${companySettings?.payment_info ? `<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;"><p style="font-size: 12px; color: #999; margin: 0;">${companySettings.payment_info}</p></div>` : ''}
    `;

    document.body.appendChild(invoiceContent);

    try {
      const canvas = await html2canvas(invoiceContent, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

      if (imgHeight > 297) {
        let heightLeft = imgHeight - 297;
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= 297;
        }
      }

      pdf.save(`Invoice-${sale.id.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Invoice generated');
    } catch (error) {
      toast.error('Failed to generate invoice');
    } finally {
      document.body.removeChild(invoiceContent);
    }
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
              <TableHead className="text-slate-500 text-right">Actions</TableHead>
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
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingInvoice(sale)}
                      className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => generateInvoice(sale)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(sale)}
                      className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(sale.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setEditingSale(null);
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
        }
      }}>
        <DialogContent className="bg-[hsl(224,20%,9%)] border-white/[0.06] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="gradient-text">{editingSale ? 'Edit Sale' : 'Add New Sale'}</DialogTitle>
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
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setEditingSale(null);
            }}>Cancel</Button>
            <Button
              onClick={() => addMutation.mutate(newSale)}
              disabled={!newSale.product_name || !newSale.unit_price}
              className="bg-gradient-to-r from-[#1E73FF] to-[#0056D6]"
            >
              {editingSale ? 'Update Sale' : 'Add Sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Dialog */}
      <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
        <DialogContent className="bg-white text-black max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#1E73FF]">Invoice Preview</DialogTitle>
          </DialogHeader>
          {viewingInvoice && (
            <div className="space-y-6 p-6">
              {companySettings?.logo_url && (
                <img src={companySettings.logo_url} alt="Logo" className="h-20 mb-4" />
              )}
              <h1 className="text-3xl font-bold text-[#1E73FF]">INVOICE</h1>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm text-gray-600 mb-2">FROM</h3>
                  <p className="font-bold text-lg">{companySettings?.company_name || 'Company Name'}</p>
                  <p className="text-gray-600">{companySettings?.address || ''}</p>
                  <p className="text-gray-600">{companySettings?.phone || ''}</p>
                  <p className="text-gray-600">{companySettings?.email || ''}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-600 mb-2">TO</h3>
                  <p className="font-bold text-lg">{viewingInvoice.customer_name || 'Customer'}</p>
                  <p className="text-gray-600">{viewingInvoice.customer_email || ''}</p>
                  <p className="mt-4"><strong>Date:</strong> {viewingInvoice.sale_date ? new Date(viewingInvoice.sale_date).toLocaleDateString() : ''}</p>
                  <p><strong>Invoice #:</strong> {viewingInvoice.id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>

              <table className="w-full border-collapse mt-8">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left border-b-2 border-gray-300">Product</th>
                    <th className="p-3 text-center border-b-2 border-gray-300">Quantity</th>
                    <th className="p-3 text-right border-b-2 border-gray-300">Unit Price</th>
                    <th className="p-3 text-right border-b-2 border-gray-300">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-gray-200">{viewingInvoice.product_name}</td>
                    <td className="p-3 text-center border-b border-gray-200">{viewingInvoice.quantity}</td>
                    <td className="p-3 text-right border-b border-gray-200">${viewingInvoice.unit_price?.toFixed(2)}</td>
                    <td className="p-3 text-right border-b border-gray-200">${viewingInvoice.total_amount?.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="text-right mt-8">
                <p className="text-3xl font-bold text-[#1E73FF]">Total: ${viewingInvoice.total_amount?.toFixed(2)}</p>
                <p className="text-gray-600 mt-2">Status: {viewingInvoice.status}</p>
                {viewingInvoice.payment_method && (
                  <p className="text-gray-600">Payment Method: {viewingInvoice.payment_method}</p>
                )}
              </div>

              {viewingInvoice.notes && (
                <div className="mt-8 p-4 bg-blue-50 border-l-4 border-[#1E73FF]">
                  <p className="text-gray-700"><strong>Notes:</strong> {viewingInvoice.notes}</p>
                </div>
              )}

              {companySettings?.payment_info && (
                <div className="mt-8 pt-6 border-t border-gray-300">
                  <p className="text-sm text-gray-500">{companySettings.payment_info}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingInvoice(null)}>Close</Button>
            <Button
              onClick={() => {
                generateInvoice(viewingInvoice);
                setViewingInvoice(null);
              }}
              className="bg-gradient-to-r from-[#1E73FF] to-[#0056D6]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}