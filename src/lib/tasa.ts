import { prisma } from "./prisma";

export async function getTasaDelDia(sucursalId?: string): Promise<number | null> {
  const where: any = {};
  if (sucursalId) where.sucursalId = sucursalId;

  const tasa = await prisma.tasaCambio.findFirst({
    where,
    orderBy: { createdAt: "desc" },
  });

  return tasa?.tasa ?? null;
}
