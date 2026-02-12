import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Trash2, FileText, Filter, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ViewQuoteDialog from "../components/quote/ViewQuoteDialog";

const statusColors = {
  draft: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  sent: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  accepted: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function QuoteHistory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingQuote, setViewingQuote] = useState(null);
  const [selectedQuotes, setSelectedQuotes] = useState([]);
  const queryClient = useQueryClient();

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => base44.entities.Quote.list("-created_date", 100),
  });

  const { data: companySettings } = useQuery({
    queryKey: ['companySettings'],
    queryFn: async () => {
      const settings = await base44.entities.CompanySettings.list();
      return settings[0] || null;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Quote.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("Quote deleted");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Quote.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("Status updated");
    },
  });

  const filtered = quotes.filter((q) => {
    const matchSearch = !search || q.part_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCombineQuotes = () => {
    if (selectedQuotes.length < 2) {
      toast.error("Select at least 2 quotes to combine");
      return;
    }

    const quotesToCombine = quotes.filter(q => selectedQuotes.includes(q.id));
    const combined = {
      part_name: quotesToCombine.map(q => q.part_name).join(", "),
      parts: quotesToCombine.map(q => ({
        name: q.part_name,
        material: q.filament_type,
        weight: q.material_weight_g,
        quantity: q.batch_quantity || 1
      })),
      material_cost: quotesToCombine.reduce((sum, q) => sum + (q.material_cost || 0), 0),
      labor_cost: quotesToCombine.reduce((sum, q) => sum + (q.labor_cost || 0), 0),
      machine_cost: quotesToCombine.reduce((sum, q) => sum + (q.machine_cost || 0), 0),
      electricity_cost: quotesToCombine.reduce((sum, q) => sum + (q.electricity_cost || 0), 0),
      hardware_cost: quotesToCombine.reduce((sum, q) => sum + (q.hardware_cost || 0), 0),
      packaging_cost: quotesToCombine.reduce((sum, q) => sum + (q.packaging_cost || 0), 0),
      total_cost: quotesToCombine.reduce((sum, q) => sum + (q.total_cost || 0), 0),
      final_price: quotesToCombine.reduce((sum, q) => sum + (q.final_price || 0), 0),
      final_price_with_vat: quotesToCombine.reduce((sum, q) => sum + (q.final_price_with_vat || 0), 0),
      selected_margin: Math.round(quotesToCombine.reduce((sum, q) => sum + (q.selected_margin || 0), 0) / quotesToCombine.length),
      status: "draft",
      combined: true
    };

    setViewingQuote(combined);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {selectedQuotes.length > 0 && (
            <Button
              onClick={handleCombineQuotes}
              className="bg-gradient-to-r from-[#1E73FF] to-[#0056D6] hover:from-[#4A9AFF] hover:to-[#1E73FF]"
            >
              Combine {selectedQuotes.length} Quotes
            </Button>
          )}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search quotes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700/50 text-white rounded-xl h-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700/50 text-white rounded-xl h-10">
              <Filter className="w-4 h-4 mr-2 text-slate-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-slate-200">All Status</SelectItem>
              <SelectItem value="draft" className="text-slate-200">Draft</SelectItem>
              <SelectItem value="sent" className="text-slate-200">Sent</SelectItem>
              <SelectItem value="accepted" className="text-slate-200">Accepted</SelectItem>
              <SelectItem value="rejected" className="text-slate-200">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-slate-500 font-medium text-xs w-12"></TableHead>
                <TableHead className="text-slate-500 font-medium text-xs">Part Name</TableHead>
                <TableHead className="text-slate-500 font-medium text-xs">Category</TableHead>
                <TableHead className="text-slate-500 font-medium text-xs">Material</TableHead>
                <TableHead className="text-slate-500 font-medium text-xs">Total Cost</TableHead>
                <TableHead className="text-slate-500 font-medium text-xs">Price</TableHead>
                <TableHead className="text-slate-500 font-medium text-xs">Margin</TableHead>
                <TableHead className="text-slate-500 font-medium text-xs">Status</TableHead>
                <TableHead className="text-slate-500 font-medium text-xs">Date</TableHead>
                <TableHead className="text-slate-500 font-medium text-xs w-28"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((q) => (
                <TableRow key={q.id} className="border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedQuotes.includes(q.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedQuotes([...selectedQuotes, q.id]);
                        } else {
                          setSelectedQuotes(selectedQuotes.filter(id => id !== q.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-slate-200">{q.part_name || "—"}</TableCell>
                  <TableCell className="text-slate-400 text-sm">{q.filament_type || "—"}</TableCell>
                  <TableCell className="text-slate-400 text-sm">${(q.total_cost || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-white font-medium">${(q.final_price || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-slate-400 text-sm">{q.selected_margin || 0}%</TableCell>
                  <TableCell>
                    <Select
                      value={q.status || "draft"}
                      onValueChange={(v) => updateMutation.mutate({ id: q.id, data: { status: v } })}
                    >
                      <SelectTrigger className="w-28 h-7 border-0 p-0 bg-transparent">
                        <Badge className={`${statusColors[q.status || "draft"]} border text-[11px] font-medium`}>
                          {q.status || "draft"}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="draft" className="text-slate-200">Draft</SelectItem>
                        <SelectItem value="sent" className="text-slate-200">Sent</SelectItem>
                        <SelectItem value="accepted" className="text-slate-200">Accepted</SelectItem>
                        <SelectItem value="rejected" className="text-slate-200">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {q.created_date ? format(new Date(q.created_date), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#1E73FF] hover:text-[#4A9AFF] hover:bg-[#1E73FF]/10 w-8 h-8 rounded-lg"
                        onClick={() => setViewingQuote(q)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-600 hover:text-red-400 hover:bg-red-500/10 w-8 h-8 rounded-lg"
                        onClick={() => deleteMutation.mutate(q.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12">
                    <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">No quotes found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <ViewQuoteDialog
        quote={viewingQuote}
        companySettings={companySettings}
        open={!!viewingQuote}
        onClose={() => setViewingQuote(null)}
      />
    </div>
  );
}