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
  const actual = searchParams.get("actual") === "true";

  const where = session.user.rol === "GERENTE"
    ? sucursalId ? { sucursalId } : {}
    : { sucursalId: session.user.sucursalId! };

  if (actual) {
    const ultima = await prisma.tasaCambio.findFirst({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ tasa: ultima?.tasa ?? null });
  }

  const tasas = await prisma.tasaCambio.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { sucursal: { select: { nombre: true } } },
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

    // Normalizar a medianoche local para que coincida con el formato del seed
    const fechaLocal = new Date(fecha + "T00:00:00");

    const tasaCambio = await prisma.tasaCambio.upsert({
      where: {
        fecha_sucursalId: {
          fecha: fechaLocal,
          sucursalId,
        },
      },
      update: { tasa, origen: "MANUAL" },
      create: {
        fecha: fechaLocal,
        tasa,
        sucursalId,
        origen: "MANUAL",
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
