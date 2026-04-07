"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { LogOut, Menu, X, Bell } from "lucide-react";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0].toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-[#020817]">
      {/* Sidebar — desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-[240px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 h-[60px] border-b border-border bg-[#020817]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6">
          <button
            className="md:hidden p-2 rounded-lg text-muted hover:text-white hover:bg-surface-hover transition-colors"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-muted hover:text-white hover:bg-surface-hover transition-colors">
              <Bell className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-border ml-2">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "Avatar"}
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-xs font-bold text-brand">
                  {initials}
                </div>
              )}
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-medium text-white">
                  {user?.name ?? "Usuario"}
                </span>
                <span className="text-[10px] text-muted">{user?.email}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
