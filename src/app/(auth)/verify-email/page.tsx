"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Procesando tu verificación...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Enlace inválido o incompleto. Faltan los parámetros de seguridad.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("¡Tu correo electrónico ha sido verificado con éxito!");
        } else {
          setStatus("error");
          setMessage(data.error || "Hubo un error al intentar validar el token.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Error de conexión. Inténtalo más tarde.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center animate-fade-in w-full max-w-sm px-4">
      {status === "loading" && (
        <>
          <Loader2 className="w-16 h-16 text-brand-blue animate-spin" />
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            Verificando...
          </h2>
          <p className="text-text-secondary">{message}</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="w-16 h-16 text-status-active" />
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            ¡Verificado!
          </h2>
          <p className="text-text-secondary">{message}</p>
          <div className="w-full pt-4">
            <Link href="/login" className="w-full inline-block">
              <Button className="w-full hover:bg-brand-blue-dark">
                Iniciar Sesión Ahora
              </Button>
            </Link>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="w-16 h-16 text-status-error" />
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            Verificación Fallida
          </h2>
          <p className="text-status-error/90 font-medium">{message}</p>
          <div className="w-full pt-4">
            <Link href="/register" className="w-full inline-block">
              <Button variant="outline" className="w-full">
                Solicitar nuevo registro
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-blue"/></div>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
