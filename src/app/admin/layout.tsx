import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/admin";
import { LayoutDashboard, Store, Users, CreditCard, LogOut, LifeBuoy, DollarSign } from "lucide-react";
import { signOut } from "@/lib/auth";
import { NotificationBell } from "@/components/dashboard/notification-bell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePlatformAdmin();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <img src="/vepix_logo_LP.png" alt="VePix Logo" className="h-[60px] w-auto mb-6 object-contain" />
          <h1 className="text-xl font-bold text-white tracking-tight">SuperAdmin</h1>
          <p className="text-xs text-slate-400 mt-1">Gestão da Plataforma</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            Visão Geral
          </Link>
          <Link href="/admin/tenants" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <Store className="h-5 w-5" />
            Lojas (Tenants)
          </Link>
          <Link href="/admin/finance" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            Financeiro
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <Users className="h-5 w-5" />
            Equipe SuperAdmin
          </Link>
          <Link href="/admin/plans" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <CreditCard className="h-5 w-5" />
            Planos
          </Link>
          <Link href="/admin/support" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <LifeBuoy className="h-5 w-5" />
            Suporte a Lojistas
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center font-bold">
              {session.user.name?.charAt(0) || "A"}
            </div>
            <div className="text-sm">
              <p className="font-medium text-white">{session.user.name}</p>
              <p className="text-xs text-slate-400">{session.user.role}</p>
            </div>
          </div>
          <form action={async () => { "use server"; await signOut(); }}>
            <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors">
              <LogOut className="h-5 w-5" />
              Sair do Sistema
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 shrink-0">
          <NotificationBell />
        </header>
        <div className="p-8 overflow-y-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
