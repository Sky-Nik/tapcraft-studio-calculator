import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, User, DollarSign, Building2, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_SETTINGS } from "../components/calculator/pricingEngine";

const inputClass = "bg-slate-800/50 border-slate-700/50 text-white rounded-xl h-10 text-sm";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [defaults, setDefaults] = useState({ ...DEFAULT_SETTINGS });
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: companySettings } = useQuery({
    queryKey: ['companySettings'],
    queryFn: async () => {
      const settings = await base44.entities.CompanySettings.list();
      return settings[0] || null;
    },
  });

  const [companyForm, setCompanyForm] = useState({
    company_name: "",
    logo_url: "",
    address: "",
    abn: "",
    phone: "",
    email: "",
    website: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    payment_info: "",
  });

  useEffect(() => {
    if (companySettings) {
      setCompanyForm({
        company_name: companySettings.company_name || "",
        logo_url: companySettings.logo_url || "",
        address: companySettings.address || "",
        abn: companySettings.abn || "",
        phone: companySettings.phone || "",
        email: companySettings.email || "",
        website: companySettings.website || "",
        facebook: companySettings.facebook || "",
        instagram: companySettings.instagram || "",
        linkedin: companySettings.linkedin || "",
        payment_info: companySettings.payment_info || "",
      });
    }
  }, [companySettings]);

  const saveCompanyMutation = useMutation({
    mutationFn: async (data) => {
      if (companySettings) {
        return base44.entities.CompanySettings.update(companySettings.id, data);
      } else {
        return base44.entities.CompanySettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companySettings'] });
      toast.success("Company settings saved successfully");
    },
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setCompanyForm({ ...companyForm, logo_url: file_url });
      toast.success("Logo uploaded");
    } catch (error) {
      toast.error("Failed to upload logo");
    }
  };

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u.calculator_defaults) {
        setDefaults({ ...DEFAULT_SETTINGS, ...u.calculator_defaults });
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ calculator_defaults: defaults });
    setSaving(false);
    toast.success("Settings saved");
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#1E73FF]/10 flex items-center justify-center">
            <User className="w-4 h-4 text-[#1E73FF]" />
          </div>
          <h3 className="text-sm font-semibold text-white">Profile</h3>
        </div>
        {user && (
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs text-slate-400">Name</Label><Input className={inputClass} value={user.full_name || ""} readOnly /></div>
            <div><Label className="text-xs text-slate-400">Email</Label><Input className={inputClass} value={user.email || ""} readOnly /></div>
          </div>
        )}
      </motion.div>

      {/* Company Information */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#1E73FF]/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-[#1E73FF]" />
          </div>
          <h3 className="text-sm font-semibold text-white">Company Information</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label className="text-xs text-slate-400">Company Name</Label>
            <Input
              className={inputClass}
              value={companyForm.company_name}
              onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
            />
          </div>

          <div className="col-span-2">
            <Label className="text-xs text-slate-400">Company Logo</Label>
            <div className="flex items-center gap-4">
              {companyForm.logo_url && (
                <img src={companyForm.logo_url} alt="Logo" className="h-12 w-12 object-contain bg-white rounded p-1" />
              )}
              <Button
                onClick={() => document.getElementById('logo-upload').click()}
                variant="outline"
                className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="col-span-2">
            <Label className="text-xs text-slate-400">Address</Label>
            <Textarea
              className="bg-slate-800/50 border-slate-700/50 text-white rounded-xl text-sm"
              value={companyForm.address}
              onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label className="text-xs text-slate-400">ABN</Label>
            <Input
              className={inputClass}
              value={companyForm.abn}
              onChange={(e) => setCompanyForm({ ...companyForm, abn: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs text-slate-400">Phone</Label>
            <Input
              className={inputClass}
              value={companyForm.phone}
              onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs text-slate-400">Email</Label>
            <Input
              className={inputClass}
              type="email"
              value={companyForm.email}
              onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs text-slate-400">Website</Label>
            <Input
              className={inputClass}
              value={companyForm.website}
              onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs text-slate-400">Facebook</Label>
            <Input
              className={inputClass}
              value={companyForm.facebook}
              onChange={(e) => setCompanyForm({ ...companyForm, facebook: e.target.value })}
              placeholder="https://facebook.com/..."
            />
          </div>

          <div>
            <Label className="text-xs text-slate-400">Instagram</Label>
            <Input
              className={inputClass}
              value={companyForm.instagram}
              onChange={(e) => setCompanyForm({ ...companyForm, instagram: e.target.value })}
              placeholder="@username"
            />
          </div>

          <div className="col-span-2">
            <Label className="text-xs text-slate-400">LinkedIn</Label>
            <Input
              className={inputClass}
              value={companyForm.linkedin}
              onChange={(e) => setCompanyForm({ ...companyForm, linkedin: e.target.value })}
              placeholder="https://linkedin.com/..."
            />
          </div>

          <div className="col-span-2">
            <Label className="text-xs text-slate-400">Payment Information</Label>
            <Textarea
              className="bg-slate-800/50 border-slate-700/50 text-white rounded-xl text-sm"
              value={companyForm.payment_info}
              onChange={(e) => setCompanyForm({ ...companyForm, payment_info: e.target.value })}
              rows={3}
              placeholder="Bank details, payment terms, etc."
            />
          </div>
        </div>

        <Button
          onClick={() => saveCompanyMutation.mutate(companyForm)}
          disabled={saveCompanyMutation.isPending}
          className="mt-6 bg-gradient-to-r from-[#1E73FF] to-[#0056D6] hover:from-[#4A9AFF] hover:to-[#1E73FF] text-white rounded-xl h-11 shadow-lg shadow-[#1E73FF]/20"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveCompanyMutation.isPending ? "Saving..." : "Save Company Settings"}
        </Button>
      </motion.div>

      {/* Default Calculator Settings */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Default Calculator Settings</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-xs text-slate-400">VAT %</Label><Input type="number" className={inputClass} value={defaults.vatPercent || ""} onChange={(e) => setDefaults({ ...defaults, vatPercent: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label className="text-xs text-slate-400">Labor Rate ($/hr)</Label><Input type="number" className={inputClass} value={defaults.laborRate || ""} onChange={(e) => setDefaults({ ...defaults, laborRate: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label className="text-xs text-slate-400">Material Efficiency</Label><Input type="number" step="0.01" className={inputClass} value={defaults.materialEfficiency || ""} onChange={(e) => setDefaults({ ...defaults, materialEfficiency: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label className="text-xs text-slate-400">Buffer Factor</Label><Input type="number" step="0.01" className={inputClass} value={defaults.bufferFactor || ""} onChange={(e) => setDefaults({ ...defaults, bufferFactor: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label className="text-xs text-slate-400">Electricity ($/kWh)</Label><Input type="number" step="0.01" className={inputClass} value={defaults.electricityCostPerKwh || ""} onChange={(e) => setDefaults({ ...defaults, electricityCostPerKwh: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label className="text-xs text-slate-400">Default Printer Cost ($)</Label><Input type="number" className={inputClass} value={defaults.printerCost || ""} onChange={(e) => setDefaults({ ...defaults, printerCost: parseFloat(e.target.value) || 0 })} /></div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="mt-6 bg-gradient-to-r from-[#1E73FF] to-[#0056D6] hover:from-[#4A9AFF] hover:to-[#1E73FF] text-white rounded-xl h-11 shadow-lg shadow-[#1E73FF]/20">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </motion.div>
    </div>
  );
}