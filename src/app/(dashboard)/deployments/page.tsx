import { Badge, statusToBadgeVariant } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, Plus, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Despliegues" };

// Mock data — Phase 1
const mockDeployments = [
  {
    id: "dep-001",
    name: "ERPNext — Acme Corp",
    type: "ERPNext",
    status: "ACTIVE",
    domain: "erp.acmecorp.com",
    plan: "Business",
    ip: "149.248.10.22",
    createdAt: "2026-03-15",
  },
  {
    id: "dep-002",
    name: "n8n — Automate Co",
    type: "n8n",
    status: "PROVISIONING",
    domain: "n8n.automateco.net",
    plan: "Starter",
    ip: "85.215.44.100",
    createdAt: "2026-04-01",
  },
  {
    id: "dep-003",
    name: "ERPNext — Beta Client",
    type: "ERPNext",
    status: "PENDING",
    domain: "—",
    plan: "Starter",
    ip: "—",
    createdAt: "2026-04-06",
  },
  {
    id: "dep-004",
    name: "ERPNext — Old Tenant",
    type: "ERPNext",
    status: "STOPPED",
    domain: "erp.oldtenant.io",
    plan: "Enterprise",
    ip: "194.163.128.5",
    createdAt: "2025-11-20",
  },
  {
    id: "dep-005",
    name: "ERPNext — Gamma SA",
    type: "ERPNext",
    status: "ERROR",
    domain: "—",
    plan: "Business",
    ip: "—",
    createdAt: "2026-04-04",
  },
];

const statusLabel: Record<string, string> = {
  ACTIVE: "Activo",
  PROVISIONING: "Provisionando",
  PENDING: "Pendiente",
  STOPPED: "Detenido",
  ERROR: "Error",
  INSTALLING: "Instalando",
};

export default function DeploymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Despliegues</h1>
          <p className="text-sm text-muted mt-1">
            Gestiona todas tus instancias de ERPNext y n8n
          </p>
        </div>
        <Button
          id="btn-new-deployment"
          disabled
          title="Disponible en Fase 2 — Aprovisionamiento"
        >
          <Plus className="w-4 h-4" />
          Nuevo despliegue
        </Button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(
          mockDeployments.reduce<Record<string, number>>((acc, d) => {
            acc[d.status] = (acc[d.status] ?? 0) + 1;
            return acc;
          }, {})
        ).map(([status, count]) => (
          <Badge key={status} variant={statusToBadgeVariant(status)}>
            {statusLabel[status] ?? status}: {count}
          </Badge>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los despliegues</CardTitle>
          <span className="text-xs text-muted">{mockDeployments.length} instancias</span>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["#", "Nombre", "Tipo", "Estado", "Dominio / IP", "Plan", "Creado", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-medium text-muted py-2 pr-4 last:pr-0"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockDeployments.map((d, i) => (
                  <tr
                    key={d.id}
                    className="hover:bg-surface-hover transition-colors group"
                  >
                    <td className="py-3 pr-4 text-muted text-xs font-mono">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-surface-elevated border border-border flex items-center justify-center shrink-0">
                          <Server className="w-3.5 h-3.5 text-muted" />
                        </div>
                        <span className="font-medium text-white text-sm">
                          {d.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-muted font-mono bg-surface-elevated px-2 py-0.5 rounded">
                        {d.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={statusToBadgeVariant(d.status)}>
                        {statusLabel[d.status] ?? d.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-white">{d.domain}</span>
                        <span className="text-[10px] text-muted font-mono">
                          {d.ip}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted text-xs">{d.plan}</td>
                    <td className="py-3 pr-4 text-muted text-xs">{d.createdAt}</td>
                    <td className="py-3">
                      {d.status === "ACTIVE" && d.domain !== "—" && (
                        <a
                          href={`https://${d.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-muted hover:text-brand hover:bg-brand/10 transition-colors inline-flex"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
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
