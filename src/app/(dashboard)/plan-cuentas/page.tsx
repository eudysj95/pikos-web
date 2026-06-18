import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PlanCuentasClient from "./PlanCuentasClient";

export default async function PlanCuentasPage() {
  const session = await auth();
  const isGerente = session?.user?.rol === "GERENTE";

  const where = isGerente ? {} : { sucursalId: session?.user?.sucursalId! };
  const sucursales = isGerente
    ? await prisma.sucursal.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } })
    : [];

  const cuentas = await prisma.planCuenta.findMany({
    where,
    orderBy: { codigo: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Plan de Cuentas</h1>
        <p className="text-slate-500">Catálogo de cuentas contables por sucursal</p>
      </div>

      <PlanCuentasClient
        cuentas={cuentas}
        sucursales={sucursales}
        isGerente={isGerente}
        sucursalId={session?.user?.sucursalId ?? ""}
      />
    </div>
  );
}
