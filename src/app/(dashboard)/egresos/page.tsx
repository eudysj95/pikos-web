import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EgresosClient from "./EgresosClient";

const CATEGORIAS = ["COSTOS", "PERSONAL", "FUNCIONAMIENTO"];

export default async function EgresosPage() {
  const session = await auth();
  const isGerente = session?.user?.rol === "GERENTE";
  const sucursales = isGerente
    ? await prisma.sucursal.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } })
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Egresos</h1>
        <p className="text-slate-500">Costos, personal y funcionamiento</p>
      </div>
      <EgresosClient categorias={CATEGORIAS} sucursales={sucursales} isGerente={isGerente} userSucursalId={session?.user?.sucursalId ?? ""} />
    </div>
  );
}
