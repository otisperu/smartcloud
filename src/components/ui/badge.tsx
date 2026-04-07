import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant =
  | "active"
  | "provisioning"
  | "error"
  | "pending"
  | "stopped"
  | "default";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  active:
    "bg-green-500/10 text-green-400 border-green-500/20",
  provisioning:
    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  error:
    "bg-red-500/10 text-red-400 border-red-500/20",
  pending:
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  stopped:
    "bg-slate-500/10 text-slate-400 border-slate-500/20",
  default:
    "bg-white/5 text-muted border-border",
};

const dots: Record<BadgeVariant, string> = {
  active: "bg-green-400",
  provisioning: "bg-blue-400 animate-pulse",
  error: "bg-red-400",
  pending: "bg-amber-400 animate-pulse",
  stopped: "bg-slate-400",
  default: "bg-muted",
};

export function Badge({
  children,
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
      {...props}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dots[variant])} />
      {children}
    </span>
  );
}

export function statusToBadgeVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    ACTIVE: "active",
    INSTALLING: "provisioning",
    PROVISIONING: "provisioning",
    ERROR: "error",
    PENDING: "pending",
    STOPPED: "stopped",
  };
  return map[status.toUpperCase()] ?? "default";
}
