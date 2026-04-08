import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { name, currentPassword, newPassword } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const updateData: { name?: string; passwordHash?: string } = {};

    // 1. Actualizar Nombre if provisto
    if (name && name.trim().length > 0) {
      updateData.name = name.trim();
    }

    // 2. Actualizar Contraseña if provista (Requiere validar antigua)
    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "La nueva contraseña debe tener al menos 8 caracteres" }, { status: 400 });
      }

      if (!currentPassword) {
        return NextResponse.json({ error: "Debe ingresar su contraseña actual para establecer una nueva." }, { status: 400 });
      }

      if (!user.passwordHash) {
         // Si se registró con OAuth y no tiene password, no puede "cambiarla", o debemos permitir crear una.
         return NextResponse.json({ error: "Cuentas registradas vía Google no pueden cambiar contraseña por este medio sin configuración previa." }, { status: 400 });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "La contraseña actual suministrada es incorrecta." }, { status: 403 });
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No se proporcionaron campos para actualizar." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({ message: "Perfil actualizado exitosamente", name: updatedUser.name }, { status: 200 });

  } catch (error) {
    console.error("[PROFILE UPDATE ERROR]", error);
    return NextResponse.json({ error: "Error interno del servidor actualizando perfil" }, { status: 500 });
  }
}
