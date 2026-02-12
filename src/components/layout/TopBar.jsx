import React from "react";
import { ChevronRight } from "lucide-react";

const pageTitles = {
  Dashboard: "Dashboard",
  Calculator: "Quote Calculator",
  QuoteHistory: "Quote History",
  Filaments: "Filament Inventory",
  Printers: "Printer Profiles",
  Hardware: "Hardware Inventory",
  Packaging: "Packaging Inventory",
  Tools: "Tools",
  Settings: "Settings",
};

const pageBreadcrumbs = {
  Dashboard: ["Home"],
  Calculator: ["Home", "Calculator"],
  QuoteHistory: ["Home", "Quotes"],
  Filaments: ["Home", "Inventory", "Filaments"],
  Printers: ["Home", "Inventory", "Printers"],
  Hardware: ["Home", "Inventory", "Hardware"],
  Packaging: ["Home", "Inventory", "Packaging"],
  Tools: ["Home", "Tools"],
  Settings: ["Home", "Settings"],
};

export default function TopBar({ currentPage }) {
  const title = pageTitles[currentPage] || currentPage;
  const breadcrumbs = pageBreadcrumbs[currentPage] || ["Home"];

  return (
    <header className="h-16 border-b border-white/[0.06] bg-[hsl(224,25%,6%)]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center px-6 lg:px-8">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              <span className={i === breadcrumbs.length - 1 ? "text-slate-400" : ""}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
        <h2 className="text-lg font-semibold text-white tracking-tight truncate">{title}</h2>
      </div>
    </header>
  );
}