"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { getNotifications, markNotificationAsRead, markAllAsRead } from "@/lib/actions/notifications";
import { useRouter, usePathname } from "next/navigation";

type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
};

export function NotificationBell() {
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchNotifications() {
    const res = await getNotifications();
    if (res.notifications) {
      setNotifications(res.notifications as any);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchNotifications();
    
    // Refresh contínuo a cada 15 segundos
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  async function handleMarkAsRead(id: string) {
    // Optimistic update
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    await markNotificationAsRead(id);
  }

  async function handleMarkAll() {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    await markAllAsRead();
  }

  function handleNotificationClick(n: Notification) {
    if (!n.read) {
      handleMarkAsRead(n.id);
    }
    setIsOpen(false);
    const baseUrl = pathname.startsWith("/admin") ? "/admin/support" : "/dashboard/support";
    router.push(baseUrl);
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-slate-500 hover:text-slate-700 transition-colors p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Notificações</h3>
              {unreadCount > 0 && (
                <button onClick={handleMarkAll} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Marcar todas lidas
                </button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-slate-500">Carregando...</div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Nenhuma notificação no momento.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-4 transition hover:bg-slate-50 cursor-pointer ${n.read ? 'bg-white opacity-70' : 'bg-blue-50/50'}`} onClick={() => handleNotificationClick(n)}>
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-sm ${n.read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
                          {n.message}
                        </p>
                        {!n.read && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id); }}
                            className="text-blue-500 hover:text-blue-700 flex-shrink-0 bg-white rounded-full p-1 shadow-sm border border-slate-200"
                            title="Marcar como lida"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2 block">
                        {new Date(n.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
