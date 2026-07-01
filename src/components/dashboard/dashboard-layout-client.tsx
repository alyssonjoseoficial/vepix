"use client";

import { useState } from "react";
import { DashboardSidebar } from "./sidebar";
import { DashboardHeader } from "./header";
import { Menu, X } from "lucide-react";

export function DashboardLayoutClient({
  children,
  user,
  storeName,
  storeSlug,
  storeLogo,
}: {
  children: React.ReactNode;
  user: any;
  storeName: string;
  storeSlug: string;
  storeLogo?: string | null;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      {/* Overlay translúcido/esfumaçado no mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Oculta no mobile (a menos que aberta) e visível no Desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full w-64 flex-col bg-white/95 backdrop-blur-md shadow-2xl lg:shadow-none lg:bg-white border-r border-slate-200">
          <div className="absolute top-4 right-4 lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 bg-slate-100 rounded-md text-slate-500 hover:bg-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          <DashboardSidebar storeName={storeName} storeSlug={storeSlug} storeLogo={storeLogo} onNavigate={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader 
          user={user} 
          onOpenMenu={() => setIsMobileMenuOpen(true)} 
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
