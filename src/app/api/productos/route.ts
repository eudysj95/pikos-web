import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sucursalId = searchParams.get("sucursalId") || session.user.sucursalId;

  const where: any = { activo: true };
  if (session.user.rol !== "GERENTE") where.sucursalId = session.user.sucursalId!;
  else if (sucursalId) where.sucursalId = sucursalId;

  const productos = await prisma.producto.findMany({ where, orderBy: { nombre: "asc" } });

  const withStock = await Promise.all(
    productos.map(async (p) => {
      const last = await prisma.movimientoStock.findFirst({
        where: { productoId: p.id },
        orderBy: { createdAt: "desc" },
      });
      return { ...p, stockActual: last?.stockNuevo ?? 0 };
    })
  );

  return NextResponse.json(withStock);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { nombre, precioUSD, precioBS, stockMinimo, categoria } = await req.json();
    const sucursalId = session.user.sucursalId!;
    const producto = await prisma.producto.create({
      data: { nombre, precioUSD: precioUSD || 0, precioBS: precioBS || 0, stockMinimo: stockMinimo || 0, categoria: categoria || "OTROS", sucursalId },
    });
    return NextResponse.json(producto);
  } catch { return NextResponse.json({ error: "Error al crear producto" }, { status: 500 }); }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id, nombre, precioUSD, precioBS, stockMinimo, categoria, activo } = await req.json();
    const producto = await prisma.producto.update({
      where: { id },
      data: { nombre, precioUSD, precioBS, stockMinimo, categoria, activo },
    });
    return NextResponse.json(producto);
  } catch { return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 }); }
}
