import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTasaDelDia } from "@/lib/tasa";
import DateRangeFilter from "@/components/DateRangeFilter";

type Props = {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
};

export default async function DashboardHome(props: Props) {
  const searchParams = await props.searchParams;
  const session = await auth();
  const isGerente = session?.user?.rol === "GERENTE";
  const userSucursalId = session?.user?.sucursalId;

  const hoy = new Date().toISOString().split("T")[0];
  const desdeStr = searchParams.desde || hoy;
  const hastaStr = searchParams.hasta || hoy;

  const diaInicio = new Date(desdeStr + "T00:00:00.000Z");
  const diaFin = new Date(hastaStr + "T00:00:00.000Z");
  diaFin.setDate(diaFin.getDate() + 1); // inclusive

  const where = isGerente ? {} : { sucursalId: userSucursalId ?? "" };
  const whereFecha = { ...where, fecha: { gte: diaInicio, lt: diaFin } };

  const [sucursalesCount, operacionesCount, rangeOps, tasa] = await Promise.all([
    prisma.sucursal.count({ where: isGerente ? {} : { id: userSucursalId ?? "" } }),
    prisma.operacionDiaria.count({ where }),
    prisma.operacionDiaria.findMany({
      where: whereFecha,
      orderBy: { tipoJuego: "asc" },
    }),
    getTasaDelDia(userSucursalId ?? undefined),
  ]);

  const rangeUSD = rangeOps.filter((o) => o.moneda === "USD");
  const rangeBS = rangeOps.filter((o) => o.moneda === "BS");
  const totalVentasUSD = rangeUSD.reduce((s, o) => s + o.ventas, 0);
  const totalSaldoUSD = rangeUSD.reduce((s, o) => s + o.saldo, 0);
  const totalVentasBS = rangeBS.reduce((s, o) => s + o.ventas, 0);
  const totalSaldoBS = rangeBS.reduce((s, o) => s + o.saldo, 0);
  const ventasBSdeUSD = tasa ? totalVentasUSD * tasa : 0;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500">
              {isGerente
                ? "Vista general de todas las sucursales"
                : `Sucursal: ${session?.user?.sucursalNombre}`}
            </p>
          </div>
          <DateRangeFilter desde={desdeStr} hasta={hastaStr} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <p className="text-sm text-slate-500">Sucursales</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{sucursalesCount}</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <p className="text-sm text-slate-500">Ventas USD</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">${totalVentasUSD.toFixed(2)}</p>
          {tasa && <p className="text-xs text-slate-400 mt-1">Bs. {ventasBSdeUSD.toFixed(2)} (tasa: {tasa})</p>}
        </div>
        <div className="bg-white rounded-xl border p-6">
          <p className="text-sm text-slate-500">Saldo USD</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">${totalSaldoUSD.toFixed(2)}</p>
          {tasa && <p className="text-xs text-slate-400 mt-1">Bs. {(totalSaldoUSD * tasa).toFixed(2)}</p>}
        </div>
        <div className="bg-white rounded-xl border p-6">
          <p className="text-sm text-slate-500">Ventas Bs.</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">Bs. {totalVentasBS.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Bienvenido a PIKOS Web
        </h2>
        <p className="text-slate-600">
          Sistema de gestión multi-sucursal para centro de apuestas.
          Usá el menú lateral para navegar entre las secciones.
        </p>
      </div>
    </div>
  );
}
