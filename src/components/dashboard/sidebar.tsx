"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  CreditCard,
  Globe,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Despliegues",
    href: "/dashboard/deployments",
    icon: Server,
  },
  {
    label: "Planes",
    href: "/dashboard/plans",
    icon: Zap,
  },
  {
    label: "Dominios",
    href: "/dashboard/domains",
    icon: Globe,
  },
  {
    label: "Facturación",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    label: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] flex flex-col border-r border-border bg-surface z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[60px] border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.4)]">
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold text-white tracking-tight">
          SmartCloud<span className="text-brand">OPS</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-brand/10 text-brand border border-brand/20"
                  : "text-muted hover:bg-surface-hover hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? "text-brand" : "text-muted-dark"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated">
          <span className="w-2 h-2 rounded-full bg-status-active animate-pulse" />
          <span className="text-xs text-muted">Sistema operativo</span>
        </div>
      </div>
    </aside>
  );
}
