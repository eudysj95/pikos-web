import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const fechaParam = searchParams.get("fecha") || new Date().toISOString().split("T")[0];
  const sucursalId = searchParams.get("sucursalId") || session.user.sucursalId;

  const where: any = { fecha: new Date(fechaParam) };
  if (session.user.rol !== "GERENTE") where.sucursalId = session.user.sucursalId!;
  else if (sucursalId) where.sucursalId = sucursalId;

  const ingresos = await prisma.ingresoExtra.findMany({ where, orderBy: { descripcion: "asc" } });
  return NextResponse.json(ingresos);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { fecha, descripcion, monto } = await req.json();
    const sucursalId = session.user.sucursalId!;
    const ingreso = await prisma.ingresoExtra.create({
      data: { fecha: new Date(fecha), descripcion, monto, sucursalId },
    });
    return NextResponse.json(ingreso);
  } catch { return NextResponse.json({ error: "Error al crear ingreso" }, { status: 500 }); }
}
