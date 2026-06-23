import { prisma } from "./_lib/prisma";

export const schedule = "@daily";

export default async () => {
  console.log("fetch-bcv-rate: starting daily fetch");

  if (!process.env.DATABASE_URL) {
    console.error("Missing required env: DATABASE_URL");
    return new Response("Missing DATABASE_URL", { status: 500 });
  }

  // Fetch BCV rate from public API
  let rateData: unknown;
  try {
    const res = await fetch("https://bcv.today/api/v1/rate.json", {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`BCV API returned status ${res.status}`);
      return new Response("OK", { status: 200 });
    }
    rateData = await res.json();
  } catch (err) {
    console.error("Error fetching BCV API:", err);
    return new Response("OK", { status: 200 });
  }

  const body = rateData as Record<string, unknown>;
  if (typeof body?.USD !== "number") {
    console.error("BCV API response missing USD field:", JSON.stringify(body));
    return new Response("OK", { status: 200 });
  }

  const usdRate = body.USD as number;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  try {
    const sucursales = await prisma.sucursal.findMany({
      where: { activa: true },
    });

    console.log(
      `fetch-bcv-rate: upserting rate ${usdRate} for ${sucursales.length} sucursales`,
    );

    // Option B: always overwrite — upsert unconditionally
    for (const sucursal of sucursales) {
      await prisma.tasaCambio.upsert({
        where: {
          fecha_sucursalId: {
            fecha: today,
            sucursalId: sucursal.id,
          },
        },
        update: {
          tasa: usdRate,
          origen: "BCV_AUTO",
        },
        create: {
          fecha: today,
          tasa: usdRate,
          sucursalId: sucursal.id,
          origen: "BCV_AUTO",
        },
      });
    }

    console.log("fetch-bcv-rate: completed successfully");
  } catch (err) {
    console.error("fetch-bcv-rate: error during upsert:", err);
  }

  return new Response("OK", { status: 200 });
};
