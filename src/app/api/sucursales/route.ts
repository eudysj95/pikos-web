import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.rol !== "GERENTE") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const sucursales = await prisma.sucursal.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { usuarios: true } } },
  });
  return NextResponse.json(sucursales);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.rol !== "GERENTE") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { nombre, direccion, telefono } = await req.json();
    const sucursal = await prisma.sucursal.create({
      data: { nombre, direccion, telefono },
    });
    return NextResponse.json(sucursal);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear sucursal" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.rol !== "GERENTE") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id, nombre, direccion, telefono, activa } = await req.json();
    const sucursal = await prisma.sucursal.update({
      where: { id },
      data: { nombre, direccion, telefono, activa },
    });
    return NextResponse.json(sucursal);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar sucursal" },
      { status: 500 }
    );
  }
}
