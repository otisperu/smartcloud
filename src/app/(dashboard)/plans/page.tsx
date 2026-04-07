import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Server, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Planes" };

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    ram: "6 GB RAM",
    cpu: "4 vCPU",
    storage: "100 GB NVMe",
    contabo: "Cloud VPS S",
    features: [
      "ERPNext incluido",
      "SSL automático",
      "1 dominio personalizado",
      "Backups semanales",
      "Soporte por email",
    ],
    color: "border-border",
    badge: null,
  },
  {
    id: "business",
    name: "Business",
    price: 49,
    ram: "16 GB RAM",
    cpu: "6 vCPU",
    storage: "250 GB NVMe",
    contabo: "Cloud VPS M",
    features: [
      "ERPNext + n8n incluidos",
      "SSL automático",
      "3 dominios personalizados",
      "Backups diarios",
      "Soporte email + chat",
      "Panel de métricas",
    ],
    color: "border-brand/50 shadow-[0_0_30px_rgba(59,130,246,0.08)]",
    badge: "Más popular",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 89,
    ram: "30 GB RAM",
    cpu: "8 vCPU",
    storage: "400 GB NVMe",
    contabo: "Cloud VPS L",
    features: [
      "ERPNext + n8n incluidos",
      "SSL automático",
      "Dominios ilimitados",
      "Backups diarios + offsite",
      "SLA garantizado",
      "Panel de métricas avanzado",
      "Soporte prioritario",
    ],
    color: "border-border",
    badge: null,
  },
];

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Planes</h1>
        <p className="text-sm text-muted mt-1">
          Elige el plan que mejor se adapta a tu operación
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-xl border bg-surface p-6 flex flex-col transition-all duration-200 hover:border-brand/40 ${plan.color}`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="provisioning">{plan.badge}</Badge>
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">{plan.name}</h2>
                <p className="text-xs text-muted mt-0.5">{plan.contabo}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-brand" />
              </div>
            </div>

            {/* Price */}
            <div className="mb-5">
              <span className="text-3xl font-extrabold text-white">
                ${plan.price}
              </span>
              <span className="text-sm text-muted">/mes</span>
            </div>

            {/* Resources */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[plan.ram, plan.cpu, plan.storage].map((res) => (
                <div
                  key={res}
                  className="bg-surface-elevated border border-border rounded-lg px-2 py-2 text-center"
                >
                  <p className="text-[10px] leading-tight text-white font-medium">
                    {res}
                  </p>
                </div>
              ))}
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              id={`btn-plan-${plan.id}`}
              variant={plan.badge ? "primary" : "outline"}
              className="w-full"
              disabled
              title="Disponible en Fase 3 — Facturación"
            >
              Contratar <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <p className="text-center text-[10px] text-muted mt-2">
              Disponible próximamente
            </p>
          </div>
        ))}
      </div>

      {/* Info card */}
      <Card className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Server className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            Infraestructura en Contabo
          </p>
          <p className="text-xs text-muted mt-0.5">
            Cada plan mapea directamente a un VPS de Contabo. Al contratar,
            tu servidor queda listo con ERPNext en minutos.
          </p>
        </div>
      </Card>
    </div>
  );
}
