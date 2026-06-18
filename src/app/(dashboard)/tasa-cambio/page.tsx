import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TasaCambioClient from "./TasaCambioClient";

export default async function TasaCambioPage() {
  const session = await auth();
  const isGerente = session?.user?.rol === "GERENTE";
  const userSucursalId = session?.user?.sucursalId;

  const sucursales = isGerente
    ? await prisma.sucursal.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } })
    : [];

  const defaultSucursalId = userSucursalId || sucursales[0]?.id;

  const raw = defaultSucursalId
    ? await prisma.tasaCambio.findMany({
        where: { sucursalId: defaultSucursalId },
        orderBy: { fecha: "desc" },
        take: 30,
      })
    : [];

  const tasas = raw.map((t) => ({ id: t.id, fecha: t.fecha.toISOString(), tasa: t.tasa }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tasa de Cambio</h1>
        <p className="text-slate-500">Registrá la tasa USD/Bs. por día</p>
      </div>

      <TasaCambioClient
        tasas={tasas}
        sucursales={sucursales}
        isGerente={isGerente}
        userSucursalId={defaultSucursalId ?? ""}
      />
    </div>
  );
}
