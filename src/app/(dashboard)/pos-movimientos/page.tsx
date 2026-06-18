import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import POSMovimientosClient from "./POSMovimientosClient";

const TIPOS_POS = [
  { value: "PROVINCIAL", label: "Provincial" },
  { value: "BANESCO_ABAJO", label: "Banesco (Abajo)" },
  { value: "BANESCO_ARRIBA", label: "Banesco (Arriba)" },
  { value: "TAQUILLA", label: "Taquilla" },
  { value: "BARRA", label: "Barra" },
];

export default async function POSMovimientosPage() {
  const session = await auth();
  const isGerente = session?.user?.rol === "GERENTE";
  const sucursalId = session?.user?.sucursalId;

  const sucursales = isGerente
    ? await prisma.sucursal.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } })
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">POS — Movimientos</h1>
        <p className="text-slate-500">Registrá los movimientos y descuentos de POS por día</p>
      </div>

      <POSMovimientosClient
        tiposPOS={TIPOS_POS}
        sucursales={sucursales}
        isGerente={isGerente}
        userSucursalId={sucursalId ?? ""}
      />
    </div>
  );
}
