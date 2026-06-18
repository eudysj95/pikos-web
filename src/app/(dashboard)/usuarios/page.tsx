import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UsuariosClient from "./UsuariosClient";

export default async function UsuariosPage() {
  const session = await auth();
  if (session?.user?.rol !== "GERENTE") redirect("/");

  const usuarios = await prisma.usuario.findMany({
    include: { sucursal: true },
    orderBy: { createdAt: "desc" },
  });

  const sucursales = await prisma.sucursal.findMany({
    where: { activa: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
        <p className="text-slate-500">Gestioná los usuarios del sistema</p>
      </div>

      <UsuariosClient usuarios={usuarios} sucursales={sucursales} />
    </div>
  );
}
