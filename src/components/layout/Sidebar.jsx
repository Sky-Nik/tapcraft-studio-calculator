import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Calculator,
  History,
  Package,
  Wrench,
  Settings,
  ChevronDown,
  ChevronRight,
  Printer,
  Layers,
  HardDrive,
  BoxSelect,
  Menu,
  X,
  Hexagon
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { label: "Calculator", icon: Calculator, page: "Calculator" },
  { label: "Etsy Calculator", icon: Calculator, page: "EtsyCalculator" },
  { label: "Quote History", icon: History, page: "QuoteHistory" },
  {
    label: "Inventory",
    icon: Package,
    children: [
      { label: "Filaments", icon: Layers, page: "Filaments" },
      { label: "Printers", icon: Printer, page: "Printers" },
      { label: "Hardware", icon: HardDrive, page: "Hardware" },
      { label: "Packaging", icon: BoxSelect, page: "Packaging" },
    ],
  },
  { label: "Tools", icon: Wrench, page: "Tools" },
  { label: "Settings", icon: Settings, page: "Settings" },
];

export default function Sidebar({ currentPage }) {
  const [expandedGroups, setExpandedGroups] = useState(["Inventory"]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleGroup = (label) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isActive = (page) => currentPage === page;
  const isGroupActive = (children) => children?.some((c) => currentPage === c.page);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698d47eb6dec73f9ccb7c740/e920f8043_22.png"
          alt="TapCraft Studio"
          className="w-8 h-8 object-contain flex-shrink-0"
        />
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">TapCraft Studio</h1>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if (item.children) {
            const groupActive = isGroupActive(item.children);
            const expanded = expandedGroups.includes(item.label);
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    groupActive
                      ? "text-violet-300"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  )}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {expanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {expanded && (
                  <div className="ml-4 pl-4 border-l border-white/[0.06] space-y-0.5 mt-0.5 mb-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.page}
                        to={createPageUrl(child.page)}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                          isActive(child.page)
                            ? "text-white bg-violet-500/10 shadow-sm"
                            : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                        )}
                      >
                        <child.icon className="w-4 h-4" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive(item.page)
                  ? "text-white bg-gradient-to-r from-violet-500/15 to-indigo-500/10 shadow-sm border border-violet-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px]", isActive(item.page) && "text-violet-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/5 rounded-xl p-4 border border-violet-500/10">
          <p className="text-xs text-slate-400 font-medium">Pro Tip</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Use batch mode for bulk orders to get volume discounts on machine costs.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-slate-800 border border-white/10 text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[hsl(224,25%,7%)] border-r border-white/[0.06] transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}