import React from "react";
import { ChevronRight, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageTitles = {
  Dashboard: "Dashboard",
  Calculator: "Quote Calculator",
  EtsyCalculator: "Etsy Calculator",
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
  EtsyCalculator: ["Home", "Etsy Calculator"],
  QuoteHistory: ["Home", "Quotes"],
  Filaments: ["Home", "Inventory", "Filaments"],
  Printers: ["Home", "Inventory", "Printers"],
  Hardware: ["Home", "Inventory", "Hardware"],
  Packaging: ["Home", "Inventory", "Packaging"],
  Tools: ["Home", "Tools"],
  Settings: ["Home", "Settings"],
};

export default function TopBar({ currentPage, theme, toggleTheme }) {
  const title = pageTitles[currentPage] || currentPage;
  const breadcrumbs = pageBreadcrumbs[currentPage] || ["Home"];

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30 flex items-center px-6 lg:px-8">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              <span className={i === breadcrumbs.length - 1 ? "text-foreground/70" : ""}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
        <h2 className="text-lg font-semibold text-foreground tracking-tight truncate">{title}</h2>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="ml-4"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </header>
  );
}