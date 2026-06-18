import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OperacionesClient from "./OperacionesClient";

const TIPOS_JUEGO = [
  { value: "NACIONALES", label: "Nacionales" },
  { value: "BARRA", label: "Barra" },
  { value: "INMEJORABLE_TAQUILLA", label: "Inmejorable Taquilla" },
  { value: "PARLEY", label: "Parley" },
  { value: "TABLAS_FIJAS", label: "Tablas Fijas" },
  { value: "CASA_GRANDE_BETS", label: "Casa Grande Bets" },
  { value: "SISTEMA_AGENCIA_ANIMALITOS", label: "Sist. Agencia Animalitos" },
  { value: "SISTEMA_AGENCIA_TRIPLES", label: "Sist. Agencia Triples" },
  { value: "PREMIER_PLUS", label: "Premier Plus" },
  { value: "MATRIX_ANIMALITOS", label: "Matrix Animalitos" },
  { value: "MATRIX_TRIPLES", label: "Matrix Triples" },
  { value: "RACESAPP_HIPICA", label: "RacesApp Hípica" },
  { value: "RACESAPP_RECARGA", label: "RacesApp Recarga" },
  { value: "CINCO_Y_SEIS", label: "5 y 6" },
];

export default async function OperacionesPage() {
  const session = await auth();
  const isGerente = session?.user?.rol === "GERENTE";
  const sucursalId = session?.user?.sucursalId;

  const sucursales = isGerente
    ? await prisma.sucursal.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } })
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Operación Diaria</h1>
        <p className="text-slate-500">Registrá las operaciones del día por tipo de juego</p>
      </div>

      <OperacionesClient
        tiposJuego={TIPOS_JUEGO}
        sucursales={sucursales}
        isGerente={isGerente}
        userSucursalId={sucursalId ?? ""}
      />
    </div>
  );
}
