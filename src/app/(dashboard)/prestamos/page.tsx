import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MovimientosSimplesClient from "@/components/MovimientosSimplesClient";

export default async function PrestamosPage() {
  const session = await auth();
  const isGerente = session?.user?.rol === "GERENTE";
  const sucursales = isGerente
    ? await prisma.sucursal.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } })
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Préstamos</h1>
        <p className="text-slate-500">Préstamos realizados del día</p>
      </div>
      <MovimientosSimplesClient
        apiPath="/api/prestamos"
        label="Préstamo"
        sucursales={sucursales}
        isGerente={isGerente}
        userSucursalId={session?.user?.sucursalId ?? ""}
      />
    </div>
  );
}
