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

  const cuentas = await prisma.planCuenta.findMany({
    where,
    orderBy: { codigo: "asc" },
  });
  return NextResponse.json(cuentas);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { codigo, descripcion, tipo, sucursalId: bodySucursalId } = await req.json();
    const sucursalId = bodySucursalId || session.user.sucursalId;
    if (!sucursalId) {
      return NextResponse.json({ error: "sucursalId requerido" }, { status: 400 });
    }

    const cuenta = await prisma.planCuenta.create({
      data: { codigo, descripcion, tipo, sucursalId },
    });
    return NextResponse.json(cuenta);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear cuenta" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id, codigo, descripcion, tipo } = await req.json();
    const cuenta = await prisma.planCuenta.update({
      where: { id },
      data: { codigo, descripcion, tipo },
    });
    return NextResponse.json(cuenta);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar cuenta" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }
    await prisma.planCuenta.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar cuenta" },
      { status: 500 }
    );
  }
}
