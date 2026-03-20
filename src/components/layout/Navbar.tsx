"use client";

import { useEffect, useState } from "react";
import { Menu, Search, Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setNotifications(data);
      });
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify({}) });
    setNotifications(prev => prev.map(n => ({...n, isRead: true})));
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-background/80 px-4 backdrop-blur-xl md:px-8 transition-colors">
      <div className="flex items-center gap-4 md:hidden">
        <Button variant="ghost" size="icon" aria-label="Toggle Menu">
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-lg font-bold tracking-tight">HackSphere</span>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        <Button 
          variant="outline" 
          className="w-full max-w-md justify-start text-sm text-gray-400 font-normal hidden md:flex bg-black/20"
        >
          <Search className="mr-2 h-4 w-4" />
          Search events, users, clubs...
          <kbd className="ml-auto pointer-events-none inline-flex h-5 items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 text-[10px] font-medium text-gray-400">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        <div className="relative">
          <Button onClick={() => setOpen(!open)} variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </Button>
          
          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-[#111] border border-white/10 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-4 z-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-white">Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-primary hover:text-white transition-colors">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No notifications yet.</p>
                ) : notifications.map(n => (
                  <div key={n._id} className={`p-3 rounded-lg border flex gap-3 ${n.isRead ? 'bg-black/20 border-white/5 opacity-70' : 'bg-white/5 border-primary/30'}`}>
                    <div className="mt-0.5"><Bell className="w-4 h-4 text-primary" /></div>
                    <div>
                      <p className="font-semibold text-sm text-white">{n.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
