import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InventarioClient from "./InventarioClient";

export default async function InventarioPage() {
  const session = await auth();
  const isGerente = session?.user?.rol === "GERENTE";
  const sucursales = isGerente
    ? await prisma.sucursal.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } })
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
        <p className="text-slate-500">Gestión de productos y movimientos de stock</p>
      </div>
      <InventarioClient
        sucursales={sucursales}
        isGerente={isGerente}
        userSucursalId={session?.user?.sucursalId ?? (sucursales[0]?.id ?? "")}
      />
    </div>
  );
}
