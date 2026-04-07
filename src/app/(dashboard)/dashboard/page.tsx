import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Badge, statusToBadgeVariant } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Server, Zap, Globe, CreditCard } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

// Mock data — Phase 1
const mockDeployments = [
  {
    id: "1",
    name: "ERPNext — Acme Corp",
    type: "ERPNext",
    status: "ACTIVE",
    domain: "erp.acmecorp.com",
    plan: "Business",
    createdAt: "2026-03-15",
  },
  {
    id: "2",
    name: "n8n — Automate Co",
    type: "n8n",
    status: "PROVISIONING",
    domain: "n8n.automateco.net",
    plan: "Starter",
    createdAt: "2026-04-01",
  },
  {
    id: "3",
    name: "ERPNext — Beta Client",
    type: "ERPNext",
    status: "PENDING",
    domain: "—",
    plan: "Starter",
    createdAt: "2026-04-06",
  },
  {
    id: "4",
    name: "ERPNext — Old Tenant",
    type: "ERPNext",
    status: "STOPPED",
    domain: "erp.oldtenant.io",
    plan: "Enterprise",
    createdAt: "2025-11-20",
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(" ")[0] ?? "usuario";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Bienvenido, {firstName} 👋
        </h1>
        <p className="text-sm text-muted mt-1">
          Aquí está el resumen de tu infraestructura
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          label="Despliegues activos"
          value={1}
          icon={Server}
          trend="1 en provisioning"
          iconColor="text-brand"
        />
        <StatsCard
          label="Plan actual"
          value="Business"
          icon={Zap}
          trend="Renovación en 18 días"
          trendUp
          iconColor="text-amber-400"
        />
        <StatsCard
          label="Dominios configurados"
          value={2}
          icon={Globe}
          iconColor="text-teal-400"
        />
        <StatsCard
          label="Próximo cobro"
          value="$49"
          icon={CreditCard}
          trend="24 de abril, 2026"
          iconColor="text-purple-400"
        />
      </div>

      {/* Recent deployments */}
      <Card>
        <CardHeader>
          <CardTitle>Despliegues recientes</CardTitle>
          <span className="text-xs text-muted">{mockDeployments.length} total</span>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted py-2 pr-4">
                    Nombre
                  </th>
                  <th className="text-left text-xs font-medium text-muted py-2 pr-4">
                    Tipo
                  </th>
                  <th className="text-left text-xs font-medium text-muted py-2 pr-4">
                    Estado
                  </th>
                  <th className="text-left text-xs font-medium text-muted py-2 pr-4 hidden md:table-cell">
                    Dominio
                  </th>
                  <th className="text-left text-xs font-medium text-muted py-2 hidden lg:table-cell">
                    Plan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockDeployments.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-surface-hover transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium text-white">
                      {d.name}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-muted font-mono bg-surface-elevated px-2 py-0.5 rounded">
                        {d.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={statusToBadgeVariant(d.status)}>
                        {d.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted hidden md:table-cell">
                      {d.domain}
                    </td>
                    <td className="py-3 text-muted hidden lg:table-cell">
                      {d.plan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
