import React from "react";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";

export default function Layout({ children, currentPageName }) {
  return (
    <div className="dark min-h-screen bg-[hsl(224,25%,6%)] text-slate-200 flex">
      <Sidebar currentPage={currentPageName} />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <TopBar currentPage={currentPageName} />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}