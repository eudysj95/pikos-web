import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sucursalId = searchParams.get("sucursalId") || session.user.sucursalId;

  const where = session.user.rol === "GERENTE"
    ? sucursalId ? { sucursalId } : {}
    : { sucursalId: session.user.sucursalId! };

  const tasas = await prisma.tasaCambio.findMany({
    where,
    orderBy: { fecha: "desc" },
    take: 30,
  });
  return NextResponse.json(tasas);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { fecha, tasa, sucursalId: bodySucursalId } = await req.json();
    const sucursalId = bodySucursalId || session.user.sucursalId;
    if (!sucursalId) return NextResponse.json({ error: "No hay sucursal disponible" }, { status: 400 });

    const tasaCambio = await prisma.tasaCambio.upsert({
      where: {
        fecha_sucursalId: {
          fecha: new Date(fecha),
          sucursalId,
        },
      },
      update: { tasa },
      create: {
        fecha: new Date(fecha),
        tasa,
        sucursalId,
      },
    });
    return NextResponse.json(tasaCambio);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al guardar tasa de cambio" },
      { status: 500 }
    );
  }
}
