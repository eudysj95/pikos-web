import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.rol !== "GERENTE") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const usuarios = await prisma.usuario.findMany({
    include: { sucursal: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(usuarios);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.rol !== "GERENTE") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { nombre, email, password, rol, sucursalId } = await req.json();

    const exists = await prisma.usuario.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email ya registrado" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.usuario.create({
      data: {
        nombre,
        email,
        passwordHash,
        rol,
        ...(rol === "ENCARGADO" ? { sucursalId } : {}),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.rol !== "GERENTE") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id, activo } = await req.json();
    const user = await prisma.usuario.update({
      where: { id },
      data: { activo },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
