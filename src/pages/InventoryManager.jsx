import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Package, Wrench, Box, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import FilamentInventory from "../components/inventory/FilamentInventory";
import HardwareInventory from "../components/inventory/HardwareInventory";
import PackagingInventory from "../components/inventory/PackagingInventory";
import ProductInventory from "../components/inventory/ProductInventory";

export default function InventoryManager() {
  const [activeTab, setActiveTab] = useState("filaments");
  const [importing, setImporting] = useState(false);
  const queryClient = useQueryClient();

  const handleImport = async (e, entityName) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const schema = await base44.entities[entityName].schema();
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: schema
            }
          }
        }
      });

      if (result.status === "success" && result.output?.items) {
        await base44.entities[entityName].bulkCreate(result.output.items);
        queryClient.invalidateQueries();
        toast.success(`Imported ${result.output.items.length} items`);
      } else {
        toast.error("Failed to extract data from file");
      }
    } catch (error) {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const tabConfig = {
    filaments: { label: "Filaments", icon: Palette, entity: "FilamentType" },
    hardware: { label: "Hardware", icon: Wrench, entity: "HardwareItem" },
    packaging: { label: "Packaging", icon: Package, entity: "PackagingItem" },
    products: { label: "Products", icon: Box, entity: "Product" }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Inventory Manager</h1>
          <Button
            onClick={() => document.getElementById(`import-${activeTab}`).click()}
            disabled={importing}
            className="bg-gradient-to-r from-[#1E73FF] to-[#0056D6] hover:from-[#4A9AFF] hover:to-[#1E73FF]"
          >
            <Upload className="w-4 h-4 mr-2" />
            {importing ? "Importing..." : "Import from Excel"}
          </Button>
          <input
            id={`import-${activeTab}`}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => handleImport(e, tabConfig[activeTab].entity)}
            className="hidden"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-white/[0.06] p-1 rounded-xl">
            {Object.entries(tabConfig).map(([key, { label, icon: Icon }]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1E73FF] data-[state=active]:to-[#0056D6] rounded-lg"
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="filaments"><FilamentInventory /></TabsContent>
          <TabsContent value="hardware"><HardwareInventory /></TabsContent>
          <TabsContent value="packaging"><PackagingInventory /></TabsContent>
          <TabsContent value="products"><ProductInventory /></TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}