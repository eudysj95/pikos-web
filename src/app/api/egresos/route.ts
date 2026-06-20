import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hoyLocal } from "@/lib/date";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const fechaParam = searchParams.get("fecha") || hoyLocal();
  const sucursalId = searchParams.get("sucursalId") || session.user.sucursalId;

  const diaInicio = new Date(fechaParam + "T00:00:00.000Z");
  const diaFin = new Date(diaInicio);
  diaFin.setDate(diaFin.getDate() + 1);

  const where: any = { fecha: { gte: diaInicio, lt: diaFin } };
  if (session.user.rol !== "GERENTE") where.sucursalId = session.user.sucursalId!;
  else if (sucursalId) where.sucursalId = sucursalId;

  const egresos = await prisma.egreso.findMany({ where, orderBy: { categoria: "asc" } });
  return NextResponse.json(egresos);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { fecha, categoria, codigoCuenta, descripcion, monto } = await req.json();
    const sucursalId = session.user.sucursalId!;
    const egreso = await prisma.egreso.create({
      data: { fecha: new Date(fecha), categoria, codigoCuenta, descripcion, monto, sucursalId },
    });
    return NextResponse.json(egreso);
  } catch { return NextResponse.json({ error: "Error al crear egreso" }, { status: 500 }); }
}
