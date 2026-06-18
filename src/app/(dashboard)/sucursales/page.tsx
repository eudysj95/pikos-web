import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SucursalesTable from "./SucursalesTable";

export default async function SucursalesPage() {
  const session = await auth();
  if (session?.user?.rol !== "GERENTE") redirect("/");

  const sucursales = await prisma.sucursal.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { usuarios: true } } },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sucursales</h1>
          <p className="text-slate-500">Gestioná las sucursales del sistema</p>
        </div>
      </div>

      <SucursalesTable sucursales={sucursales} />
    </div>
  );
}
