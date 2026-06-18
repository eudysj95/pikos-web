import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fechaParam = searchParams.get("fecha") || new Date().toISOString().split("T")[0];
  const sucursalId = searchParams.get("sucursalId") || session.user.sucursalId;

  const where: any = { fecha: new Date(fechaParam) };
  if (session.user.rol !== "GERENTE") {
    where.sucursalId = session.user.sucursalId!;
  } else if (sucursalId) {
    where.sucursalId = sucursalId;
  }

  const movimientos = await prisma.pOSMovimiento.findMany({
    where,
    orderBy: { tipoPos: "asc" },
  });
  return NextResponse.json(movimientos);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { fecha, tipoPos, debito, credito, alimentacion, descuentoTD, descuentoTDC, descuentoAlim } = await req.json();
    const sucursalId = session.user.sucursalId!;

    const movimiento = await prisma.pOSMovimiento.upsert({
      where: {
        fecha_tipoPos_sucursalId: {
          fecha: new Date(fecha),
          tipoPos,
          sucursalId,
        },
      },
      update: {
        debito: debito || 0,
        credito: credito || 0,
        alimentacion: alimentacion || 0,
        descuentoTD: descuentoTD || 0,
        descuentoTDC: descuentoTDC || 0,
        descuentoAlim: descuentoAlim || 0,
      },
      create: {
        fecha: new Date(fecha),
        tipoPos,
        debito: debito || 0,
        credito: credito || 0,
        alimentacion: alimentacion || 0,
        descuentoTD: descuentoTD || 0,
        descuentoTDC: descuentoTDC || 0,
        descuentoAlim: descuentoAlim || 0,
        sucursalId,
      },
    });

    return NextResponse.json(movimiento);
  } catch (error) {
    return NextResponse.json({ error: "Error al guardar movimiento POS" }, { status: 500 });
  }
}
