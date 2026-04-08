import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token de verificación no proporcionado" },
        { status: 400 }
      );
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "El token es inválido o ya fue utilizado" },
        { status: 400 }
      );
    }

    if (new Date() > verificationToken.expires) {
      return NextResponse.json(
        { error: "El token ha expirado. Deberás solicitar uno nuevo." },
        { status: 400 }
      );
    }

    // Actualizar el estado del usuario usando el identifier (email)
    const updatedUser = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Eliminar el token usado para mantener limpieza y seguridad
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });

    return NextResponse.json(
      { message: "Cuenta verificada exitosamente", email: updatedUser.email },
      { status: 200 }
    );
  } catch (error) {
    console.error("[VERIFY EMAIL ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor resolviendo la verificación" },
      { status: 500 }
    );
  }
}
