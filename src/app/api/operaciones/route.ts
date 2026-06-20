import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fechaStr = searchParams.get("fecha") || new Date().toISOString().split("T")[0];
  const sucursalId = searchParams.get("sucursalId") || session.user.sucursalId;

  // Usar rango de fechas en vez de match exacto por diferencias de timezone
  const diaInicio = new Date(fechaStr + "T00:00:00.000Z");
  const diaFin = new Date(diaInicio);
  diaFin.setDate(diaFin.getDate() + 1);

  const where: any = { fecha: { gte: diaInicio, lt: diaFin } };
  if (session.user.rol !== "GERENTE") {
    where.sucursalId = session.user.sucursalId!;
  } else if (sucursalId) {
    where.sucursalId = sucursalId;
  }

  const operaciones = await prisma.operacionDiaria.findMany({
    where,
    orderBy: { tipoJuego: "asc" },
  });
  return NextResponse.json(operaciones);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { fecha, tipoJuego, moneda, ventas, pagos, reintegros, comision, observacion } = await req.json();
    const sucursalId = session.user.sucursalId!;
    const saldo = ventas - pagos - (reintegros || 0);

    const operacion = await prisma.operacionDiaria.upsert({
      where: {
        fecha_tipoJuego_moneda_sucursalId: {
          fecha: new Date(fecha),
          tipoJuego,
          moneda: moneda || "USD",
          sucursalId,
        },
      },
      update: {
        ventas,
        pagos,
        reintegros: reintegros || 0,
        comision: comision || 0,
        saldo,
        observacion,
      },
      create: {
        fecha: new Date(fecha),
        tipoJuego,
        moneda: moneda || "USD",
        ventas,
        pagos,
        reintegros: reintegros || 0,
        comision: comision || 0,
        saldo,
        observacion,
        sucursalId,
      },
    });

    return NextResponse.json(operacion);
  } catch (error) {
    return NextResponse.json({ error: "Error al guardar operación" }, { status: 500 });
  }
}
