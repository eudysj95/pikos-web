import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReportesClient from "./ReportesClient";

export default async function ReportesPage() {
  const session = await auth();
  const isGerente = session?.user?.rol === "GERENTE";
  const sucursales = isGerente
    ? await prisma.sucursal.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } })
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Reportes</h1>
        <p className="text-slate-500">Resúmenes por período</p>
      </div>
      <ReportesClient sucursales={sucursales} isGerente={isGerente} userSucursalId={session?.user?.sucursalId ?? ""} />
    </div>
  );
}
