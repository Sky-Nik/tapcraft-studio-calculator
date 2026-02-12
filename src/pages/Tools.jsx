import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ruler, RefreshCw, ArrowRightLeft } from "lucide-react";
import { motion } from "framer-motion";

const inputClass = "bg-slate-800/50 border-slate-700/50 text-white rounded-xl h-10 text-sm";

function UnitConverter() {
  const [grams, setGrams] = useState("");
  const [mm, setMm] = useState("");
  const [inches, setInches] = useState("");

  return (
    <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
          <ArrowRightLeft className="w-4 h-4 text-violet-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">Unit Converter</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs text-slate-400">Grams ↔ Kilograms</Label>
          <div className="grid grid-cols-2 gap-3 mt-1.5">
            <Input className={inputClass} type="number" placeholder="Grams" value={grams} onChange={(e) => setGrams(e.target.value)} />
            <Input className={inputClass} type="number" readOnly value={grams ? (parseFloat(grams) / 1000).toFixed(4) : ""} placeholder="Kilograms" />
          </div>
        </div>
        <div>
          <Label className="text-xs text-slate-400">Millimeters ↔ Inches</Label>
          <div className="grid grid-cols-2 gap-3 mt-1.5">
            <Input className={inputClass} type="number" placeholder="mm" value={mm} onChange={(e) => { setMm(e.target.value); setInches(e.target.value ? (parseFloat(e.target.value) / 25.4).toFixed(4) : ""); }} />
            <Input className={inputClass} type="number" placeholder="inches" value={inches} onChange={(e) => { setInches(e.target.value); setMm(e.target.value ? (parseFloat(e.target.value) * 25.4).toFixed(4) : ""); }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilamentLengthCalc() {
  const [weight, setWeight] = useState("");
  const [diameter, setDiameter] = useState("1.75");
  const [density, setDensity] = useState("1.24");

  const length = weight && diameter && density
    ? (parseFloat(weight) / (parseFloat(density) * Math.PI * Math.pow(parseFloat(diameter) / 2 / 10, 2))) / 100
    : 0;

  return (
    <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <Ruler className="w-4 h-4 text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">Filament Length Calculator</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs text-slate-400">Weight (g)</Label><Input className={inputClass} type="number" value={weight} onChange={(e) => setWeight(e.target.value)} /></div>
          <div><Label className="text-xs text-slate-400">Diameter (mm)</Label><Input className={inputClass} type="number" value={diameter} onChange={(e) => setDiameter(e.target.value)} /></div>
          <div><Label className="text-xs text-slate-400">Density (g/cm³)</Label><Input className={inputClass} type="number" value={density} onChange={(e) => setDensity(e.target.value)} /></div>
        </div>
        {length > 0 && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
            <p className="text-xs text-violet-300 mb-1">Estimated Length</p>
            <p className="text-2xl font-bold text-white">{length.toFixed(2)} m</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Tools() {
  return (
    <div className="max-w-[900px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UnitConverter />
        <FilamentLengthCalc />
      </motion.div>
    </div>
  );
}