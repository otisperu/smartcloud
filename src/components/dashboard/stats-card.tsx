import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  iconColor?: string;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  className,
  iconColor = "text-brand",
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-5 flex items-start justify-between gap-4 transition-all duration-200 hover:border-border-strong",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend && (
          <p
            className={cn(
              "text-xs font-medium mt-0.5",
              trendUp ? "text-green-400" : "text-muted"
            )}
          >
            {trend}
          </p>
        )}
      </div>
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          "bg-surface-elevated border border-border"
        )}
      >
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
    </div>
  );
}
