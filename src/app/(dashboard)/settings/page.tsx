"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  
  const [name, setName] = useState(session?.user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    // Validation
    if (newPassword && newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "La nueva contraseña y la confirmación no coinciden." });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name !== session?.user?.name ? name : undefined,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al actualizar el perfil.");
      }

      setStatus({ type: "success", message: "Perfil actualizado y guardado correctamente." });
      
      // Update next-auth session data locally if name changed
      if (name !== session?.user?.name) {
        await update({ name });
      }

      // Reset password fields on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (err: any) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Ajustes de Cuenta</h1>
        <p className="text-text-secondary mt-2">
          Gestiona tu perfil personal y la seguridad de tu acceso.
        </p>
      </div>

      <form onSubmit={handleUpdateProfile}>
        <div className="space-y-6">
          
          {/* Card de Datos Personales */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Estos datos se utilizarán en tus facturas y dashboard. El email no se puede cambiar ya que está ligado a tu facturación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Dirección de Email</label>
                <Input type="email" value={session?.user?.email || ""} disabled className="bg-bg-base/50 text-text-muted cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Nombre de contacto</label>
                <Input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ej: Elon Musk"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card de Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle>Seguridad y Contraseña</CardTitle>
              <CardDescription>
                Rellena estos campos únicamente si deseas actualizar tu contraseña actual.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Contraseña Actual</label>
                <Input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Nueva Contraseña</label>
                  <Input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Al menos 8 caracteres"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Confirmar Nueva Contraseña</label>
                  <Input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex-col items-start gap-4 border-t border-border mt-4 pt-6">
              {status && (
                <div className={`flex items-center gap-2 text-sm w-full p-3 rounded-md border ${status.type === 'success' ? 'bg-status-active/10 border-status-active/20 text-status-active' : 'bg-status-error/10 border-status-error/20 text-status-error'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {status.message}
                </div>
              )}
              <div className="flex justify-end w-full">
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Guardando...</> : "Guardar Cambios"}
                </Button>
              </div>
            </CardFooter>
          </Card>

        </div>
      </form>
    </div>
  );
}
