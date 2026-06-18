import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CuadreCajaClient from "./CuadreCajaClient";

export default async function CuadreCajaPage() {
  const session = await auth();
  const isGerente = session?.user?.rol === "GERENTE";
  const sucursales = isGerente
    ? await prisma.sucursal.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } })
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Cuadre de Caja</h1>
        <p className="text-slate-500">Cierre diario con conteo de efectivo</p>
      </div>
      <CuadreCajaClient
        sucursales={sucursales}
        isGerente={isGerente}
        userSucursalId={session?.user?.sucursalId ?? ""}
      />
    </div>
  );
}
