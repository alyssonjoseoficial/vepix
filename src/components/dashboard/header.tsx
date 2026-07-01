"use client";

import { LogOut, User, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { NotificationBell } from "./notification-bell";

export function DashboardHeader({ user, onOpenMenu }: { user: { name?: string | null; email?: string | null }, onOpenMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-4">
        {onOpenMenu && (
          <button onClick={onOpenMenu} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md">
            <Menu className="h-6 w-6" />
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-6">
        <NotificationBell />

        <div className="h-8 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
            {user.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-semibold text-slate-900 leading-tight">{user.name || "Lojista"}</span>
            <span className="text-xs text-slate-500 leading-tight">{user.email}</span>
          </div>
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sair do painel" 
          className="flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors p-2"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
