import React, { useState, useEffect } from "react";
import { ChevronRight, Sun, Moon, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

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
      <div className="flex items-center gap-2 ml-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user ? getInitials(user.full_name) : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.full_name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                {user?.role && (
                  <p className="text-xs leading-none text-muted-foreground capitalize">Role: {user.role}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}