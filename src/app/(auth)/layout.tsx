import { Zap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#020817] relative overflow-hidden px-4">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/8 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center justify-center gap-3 mb-8 group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-[0_0_24px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_32px_rgba(59,130,246,0.6)] transition-shadow">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            SmartCloud<span className="text-brand">OPS</span>
          </span>
        </Link>

        {children}
      </div>
    </main>
  );
}
