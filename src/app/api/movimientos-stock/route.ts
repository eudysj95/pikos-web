import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productoId = searchParams.get("productoId");
  const sucursalId = searchParams.get("sucursalId") || session.user.sucursalId;

  const where: any = {};
  if (productoId) where.productoId = productoId;
  else if (session.user.rol !== "GERENTE") where.sucursalId = session.user.sucursalId!;
  else if (sucursalId) where.sucursalId = sucursalId;

  const movimientos = await prisma.movimientoStock.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { producto: { select: { nombre: true } } },
  });
  return NextResponse.json(movimientos);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { productoId, tipo, cantidad, observacion, sucursalId: bodySucursalId } = await req.json();
    const sucursalId = bodySucursalId || session.user.sucursalId;
    if (!sucursalId) return NextResponse.json({ error: "sucursalId requerido" }, { status: 400 });

    const last = await prisma.movimientoStock.findFirst({
      where: { productoId },
      orderBy: { createdAt: "desc" },
    });
    const stockAnterior = last?.stockNuevo ?? 0;
    const stockNuevo = tipo === "ENTRADA" ? stockAnterior + cantidad
      : tipo === "SALIDA" ? stockAnterior - cantidad
      : cantidad;

    const movimiento = await prisma.movimientoStock.create({
      data: { fecha: new Date(), productoId, tipo, cantidad, stockAnterior, stockNuevo, observacion, sucursalId },
    });
    return NextResponse.json(movimiento);
  } catch (e) {
    console.error("movimientos-stock POST error:", e);
    return NextResponse.json({ error: "Error al registrar movimiento" }, { status: 500 });
  }
}
