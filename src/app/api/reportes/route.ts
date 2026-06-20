import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hoyLocal } from "@/lib/date";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const desde = new Date(searchParams.get("desde") || hoyLocal());
  const hasta = new Date(searchParams.get("hasta") || hoyLocal());
  const sucursalId = searchParams.get("sucursalId") || session.user.sucursalId;

  const whereBase: any = { fecha: { gte: desde, lte: hasta } };
  if (session.user.rol !== "GERENTE") whereBase.sucursalId = session.user.sucursalId!;
  else if (sucursalId) whereBase.sucursalId = sucursalId;

  const sucWhere = session.user.rol !== "GERENTE" ? { id: session.user.sucursalId! } : sucursalId ? { id: sucursalId } : {};

  const [operaciones, posMovimientos, egresos, ingresos, prestamos, cuadres, sucursalInfo] = await Promise.all([
    prisma.operacionDiaria.findMany({ where: whereBase }),
    prisma.pOSMovimiento.findMany({ where: whereBase }),
    prisma.egreso.findMany({ where: whereBase }),
    prisma.ingresoExtra.findMany({ where: whereBase }),
    prisma.prestamo.findMany({ where: whereBase }),
    prisma.cuadreCaja.findMany({ where: whereBase, orderBy: { fecha: "asc" } }),
    sucursalId ? prisma.sucursal.findUnique({ where: { id: sucursalId }, select: { nombre: true } }) : null,
  ]);

  const opsUSD = operaciones.filter((o) => o.moneda === "USD");
  const opsBS = operaciones.filter((o) => o.moneda === "BS");

  const resumen = {
    sucursal: sucursalInfo?.nombre ?? "Todas",
    desde,
    hasta,
    operaciones: {
      usd: { ventas: opsUSD.reduce((s, o) => s + o.ventas, 0), pagos: opsUSD.reduce((s, o) => s + o.pagos, 0), comision: opsUSD.reduce((s, o) => s + o.comision, 0), saldo: opsUSD.reduce((s, o) => s + o.saldo, 0) },
      bs: { ventas: opsBS.reduce((s, o) => s + o.ventas, 0), pagos: opsBS.reduce((s, o) => s + o.pagos, 0), comision: opsBS.reduce((s, o) => s + o.comision, 0), saldo: opsBS.reduce((s, o) => s + o.saldo, 0) },
      porJuego: Object.entries(
        operaciones.reduce<Record<string, { ventasUSD: number; pagosUSD: number; ventasBS: number; pagosBS: number }>>((acc, o) => {
          if (!acc[o.tipoJuego]) acc[o.tipoJuego] = { ventasUSD: 0, pagosUSD: 0, ventasBS: 0, pagosBS: 0 };
          if (o.moneda === "USD") { acc[o.tipoJuego].ventasUSD += o.ventas; acc[o.tipoJuego].pagosUSD += o.pagos; }
          else { acc[o.tipoJuego].ventasBS += o.ventas; acc[o.tipoJuego].pagosBS += o.pagos; }
          return acc;
        }, {})
      ),
    },
    pos: {
      debito: posMovimientos.reduce((s, p) => s + p.debito, 0),
      credito: posMovimientos.reduce((s, p) => s + p.credito, 0),
      descuentoTD: posMovimientos.reduce((s, p) => s + p.descuentoTD, 0),
      descuentoTDC: posMovimientos.reduce((s, p) => s + p.descuentoTDC, 0),
      descuentoAlim: posMovimientos.reduce((s, p) => s + p.descuentoAlim, 0),
    },
    egresos: {
      total: egresos.reduce((s, e) => s + e.monto, 0),
      porCategoria: Object.entries(
        egresos.reduce<Record<string, number>>((acc, e) => { acc[e.categoria] = (acc[e.categoria] || 0) + e.monto; return acc; }, {})
      ),
    },
    ingresos: ingresos.reduce((s, i) => s + i.monto, 0),
    prestamos: prestamos.reduce((s, p) => s + p.monto, 0),
    cuadre: cuadres.length > 0 ? {
      fondoInicial: cuadres[0].fondoInicial,
      totalIngresos: cuadres.reduce((s, c) => s + c.ingresosTotal, 0),
      totalSalidas: cuadres.reduce((s, c) => s + c.salidasTotal, 0),
      totalCaja: cuadres[cuadres.length - 1].totalCaja,
    } : null,
  };

  return NextResponse.json(resumen);
}
