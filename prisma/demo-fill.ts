import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Usamos el session pooler (DIRECT_URL) o el transaction pooler con pgbouncer=true
// para evitar "prepared statement already exists"
const url = (process.env.DIRECT_URL || process.env.DATABASE_URL || "").includes("pgbouncer")
  ? (process.env.DIRECT_URL || process.env.DATABASE_URL || "")
  : (process.env.DIRECT_URL || process.env.DATABASE_URL || "") + "?pgbouncer=true&connection_limit=1";

const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function diaMes(dia: number): Date {
  const d = new Date();
  d.setMonth(5); // Junio (0-indexed)
  d.setFullYear(2026);
  d.setDate(dia);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Factor comercial: más actividad findes, menos lunes */
function factorDiario(dia: number): number {
  const base = 0.5 + (dia / 30) * 0.6;
  const finde = [6, 7, 13, 14, 20, 21, 27, 28]; // sábados y domingos
  const viernes = [5, 12, 19, 26];
  if (finde.includes(dia)) return +(base * 1.25).toFixed(2);
  if (viernes.includes(dia)) return +(base * 1.1).toFixed(2);
  return +base.toFixed(2);
}

function tasaDelDia(dia: number): number {
  return +(25.0 + (dia / 30) * 3.0).toFixed(2);
}

function totalUSD(dia: number): number {
  return +(7700 * factorDiario(dia)).toFixed(2);
}
function totalBS(dia: number): number {
  return +(38500 * factorDiario(dia)).toFixed(2);
}
function totalEgresos(dia: number): number {
  return +(1880 * factorDiario(dia)).toFixed(2);
}
function totalPOS(dia: number): number {
  return +(4750 * factorDiario(dia)).toFixed(2);
}

const ops = [
  ["NACIONALES",               1000, 600,   20,  5000, 3000,  100],
  ["BARRA",                     800, 500,    0,  4000, 2500,    0],
  ["INMEJORABLE_TAQUILLA",      600, 200,   10,  3000, 1000,   50],
  ["PARLEY",                    500, 400,    5,  2500, 2000,   25],
  ["TABLAS_FIJAS",              400, 250,    0,  2000, 1250,    0],
  ["CASA_GRANDE_BETS",          300, 180,    0,  1500,  900,    0],
  ["SISTEMA_AGENCIA_ANIMALITOS",700, 350,   15,  3500, 1750,   75],
  ["SISTEMA_AGENCIA_TRIPLES",   650, 300,   10,  3250, 1500,   50],
  ["PREMIER_PLUS",              450, 250,    5,  2250, 1250,   25],
  ["MATRIX_ANIMALITOS",         350, 200,    0,  1750, 1000,    0],
  ["MATRIX_TRIPLES",            550, 300,    0,  2750, 1500,    0],
  ["RACESAPP_HIPICA",           900, 700,   30,  4500, 3500,  150],
  ["RACESAPP_RECARGA",          200,  50,    0,  1000,  250,    0],
  ["CINCO_Y_SEIS",              300, 150,    5,  1500,  750,   25],
] as const;

const posData = [
  { tipo: "PROVINCIAL",     debito: 2000, credito: 1500, alim: 300 },
  { tipo: "BANESCO_ABAJO",  debito: 1500, credito: 1000, alim: 200 },
  { tipo: "BANESCO_ARRIBA", debito: 1000, credito: 800,  alim: 100 },
  { tipo: "TAQUILLA",       debito: 3000, credito: 2000, alim: 0 },
  { tipo: "BARRA",          debito: 500,  credito: 300,  alim: 400 },
];

const egresosData = [
  { categoria: "COSTOS",       descripcion: "Compra de cervezas",       monto: 350 },
  { categoria: "PERSONAL",     descripcion: "Sueldo cajero",            monto: 1200 },
  { categoria: "FUNCIONAMIENTO", descripcion: "Electricidad",           monto: 250 },
  { categoria: "COSTOS",       descripcion: "Compra de hielo",          monto: 80 },
  { categoria: "PERSONAL",     descripcion: "Sueldo seguridad",         monto: 600 },
  { categoria: "FUNCIONAMIENTO", descripcion: "Internet y telefonía",   monto: 120 },
];

const productosExtra = [
  { nombre: "Ron Pampero 750ml",      precioUSD: 8.00,  precioBS: 0, stockMinimo: 20, categoria: "LICORES" },
  { nombre: "Whisky Buchanan's 750ml",precioUSD: 25.00, precioBS: 0, stockMinimo: 10, categoria: "LICORES" },
  { nombre: "Vodka Smirnoff 750ml",   precioUSD: 12.00, precioBS: 0, stockMinimo: 15, categoria: "LICORES" },
  { nombre: "Cigarros Marlboro caja", precioUSD: 5.00,  precioBS: 0, stockMinimo: 30, categoria: "CIGARROS" },
  { nombre: "Agua Mineral 500ml",     precioUSD: 0.50,  precioBS: 0, stockMinimo: 50, categoria: "BEBIDAS" },
  { nombre: "Pepsi Personal",         precioUSD: 1.00,  precioBS: 0, stockMinimo: 40, categoria: "BEBIDAS" },
  { nombre: "Red Bull 250ml",         precioUSD: 3.00,  precioBS: 0, stockMinimo: 25, categoria: "ENERGIZANTES" },
  { nombre: "Maní salado 100g",       precioUSD: 0.50,  precioBS: 0, stockMinimo: 30, categoria: "SNACKS" },
  { nombre: "Chicles surtidos (unidad)",precioUSD: 0.25,precioBS: 0, stockMinimo: 100,categoria: "SNACKS" },
  { nombre: "Café preparado",         precioUSD: 1.50,  precioBS: 0, stockMinimo: 20, categoria: "COMIDAS" },
  { nombre: "Polar Light 330ml",      precioUSD: 1.50,  precioBS: 0, stockMinimo: 40, categoria: "CERVEZAS" },
  { nombre: "Doritos 80g",            precioUSD: 1.00,  precioBS: 0, stockMinimo: 30, categoria: "SNACKS" },
];

const planCuentasExtra = [
  { codigo: "1.1.01.003", descripcion: "Banco Mercantil", tipo: "ACTIVO" },
  { codigo: "1.1.01.004", descripcion: "Caja Chica", tipo: "ACTIVO" },
  { codigo: "4.1.03.001", descripcion: "Venta de Productos", tipo: "INGRESO" },
  { codigo: "5.1.04.001", descripcion: "Impuestos Municipales", tipo: "EGRESO" },
  { codigo: "5.1.05.001", descripcion: "Mantenimiento", tipo: "EGRESO" },
];

async function main() {
  console.log("📦 Demo fill — poblando datos ficticios...\n");

  // ─── SUCURSALES ────────────────────────────────────────────
  let central = await prisma.sucursal.findFirst({ where: { nombre: "Sucursal Central" } });
  if (!central) {
    central = await prisma.sucursal.create({
      data: { nombre: "Sucursal Central", direccion: "Av. Principal, Local 1", telefono: "0212-5550001" },
    });
    console.log("  ✅ Creada Sucursal Central");
  }

  let este = await prisma.sucursal.findFirst({ where: { nombre: "Sucursal Este" } });
  if (!este) {
    este = await prisma.sucursal.create({
      data: { nombre: "Sucursal Este", direccion: "Calle 5, CC Plaza", telefono: "0212-5550002", activa: true },
    });
    console.log("  ✅ Creada Sucursal Este");
  } else if (!este.activa) {
    este = await prisma.sucursal.update({ where: { id: este.id }, data: { activa: true } });
    console.log("  ✅ Activada Sucursal Este");
  }

  const sucursales = [central, este];

  // ─── USUARIO PARA SUCURSAL ESTE ─────────────────────────
  const passwordHash = await bcrypt.hash("admin123", 10);
  const usuarioEste = await prisma.usuario.findFirst({ where: { email: "maria@pikos.com" } });
  if (!usuarioEste) {
    await prisma.usuario.create({
      data: { nombre: "María Encargada", email: "maria@pikos.com", passwordHash, rol: "ENCARGADO", sucursalId: este.id, activo: true },
    });
    console.log("  ✅ Usuario Sucursal Este: maria@pikos.com / admin123");
  }

  // ─── PLAN DE CUENTAS ─────────────────────────────────────
  for (const suc of sucursales) {
    const base = [
      { codigo: "1.1.01.001", descripcion: "Caja", tipo: "ACTIVO" },
      { codigo: "1.1.01.002", descripcion: "Banco Provincial", tipo: "ACTIVO" },
      { codigo: "2.1.01.001", descripcion: "Proveedores", tipo: "PASIVO" },
      { codigo: "3.1.01.001", descripcion: "Capital", tipo: "PATRIMONIO" },
      { codigo: "4.1.01.001", descripcion: "Ingresos por Juegos", tipo: "INGRESO" },
      { codigo: "4.1.02.001", descripcion: "Comisiones", tipo: "INGRESO" },
      { codigo: "5.1.01.001", descripcion: "Sueldos", tipo: "EGRESO" },
      { codigo: "5.1.02.001", descripcion: "Alquiler", tipo: "EGRESO" },
      { codigo: "5.1.03.001", descripcion: "Servicios", tipo: "EGRESO" },
    ];
    const allCuentas = [...base, ...planCuentasExtra].map(c => ({ ...c, sucursalId: suc.id }));
    for (const c of allCuentas) {
      await prisma.planCuenta.upsert({
        where: { codigo_sucursalId: { codigo: c.codigo, sucursalId: c.sucursalId } },
        update: {},
        create: c,
      });
    }
    console.log(`  ✅ Plan de cuentas → ${suc.nombre}`);
  }

  // ─── PRODUCTOS ───────────────────────────────────────────
  const productosBase = [
    { nombre: "Polar Pilsen 330ml",    precioUSD: 1.50,  precioBS: 0, stockMinimo: 50, categoria: "CERVEZAS" },
    { nombre: "Coca Cola Personal",    precioUSD: 1.00,  precioBS: 0, stockMinimo: 40, categoria: "BEBIDAS" },
    { nombre: "Papas Lays 50g",        precioUSD: 0.75,  precioBS: 0, stockMinimo: 30, categoria: "SNACKS" },
    ...productosExtra,
  ];

  for (const suc of sucursales) {
    for (const p of productosBase) {
      await prisma.producto.upsert({
        where: { nombre_sucursalId: { nombre: p.nombre, sucursalId: suc.id } },
        update: {},
        create: { ...p, sucursalId: suc.id },
      });
    }
    console.log(`  ✅ ${productosBase.length} productos → ${suc.nombre}`);
  }

  // ─── STOCK INICIAL PARA PRODUCTOS NUEVOS ─────────────────
  for (const suc of sucursales) {
    const productos = await prisma.producto.findMany({ where: { sucursalId: suc.id } });
    for (const prod of productos) {
      const existingMov = await prisma.movimientoStock.findFirst({
        where: { productoId: prod.id },
      });
      if (!existingMov) {
        const stockInicial = prod.stockMinimo * 3 + Math.floor(Math.random() * 50);
        await prisma.movimientoStock.create({
          data: {
            fecha: diaMes(1),
            productoId: prod.id,
            tipo: "ENTRADA",
            cantidad: stockInicial,
            stockAnterior: 0,
            stockNuevo: stockInicial,
            sucursalId: suc.id,
          },
        });
      }
    }
    console.log(`  ✅ Stock inicial → ${suc.nombre}`);
  }

  // ─── DATOS DIARIOS (días 1 al 30) ────────────────────────
  // Todo en batch para evitar latencia del pooler
  const variedades = [
    "Venta de chatarra", "Propina cliente", "Venta de uniformes viejos",
    "Alquiler de espacio", "Recuperación de préstamo",
  ];

  const tasasBatch: any[] = [];
  const opsBatch: any[] = [];
  const posBatch: any[] = [];
  const egresosBatch: any[] = [];
  const ingresosBatch: any[] = [];
  const prestamosBatch: any[] = [];
  const cuadresBatch: any[] = [];

  for (const suc of sucursales) {
    for (let dia = 1; dia <= 30; dia++) {
      const fecha = diaMes(dia);
      const factor = factorDiario(dia);
      const tasa = tasaDelDia(dia);

      tasasBatch.push({ fecha, tasa, sucursalId: suc.id, origen: "BCV_AUTO" });

      for (const [juego, vUSD, pUSD, rUSD, vBS, pBS, rBS] of ops) {
        opsBatch.push({
          fecha, tipoJuego: juego, moneda: "USD",
          ventas: +(vUSD * factor).toFixed(2),
          pagos: +(pUSD * factor).toFixed(2),
          reintegros: +(rUSD * factor).toFixed(2),
          comision: +((vUSD - pUSD) * factor).toFixed(2),
          saldo: +((vUSD - pUSD - rUSD) * factor).toFixed(2),
          sucursalId: suc.id,
        });
        opsBatch.push({
          fecha, tipoJuego: juego, moneda: "BS",
          ventas: +(vBS * factor).toFixed(2),
          pagos: +(pBS * factor).toFixed(2),
          reintegros: +(rBS * factor).toFixed(2),
          comision: +((vBS - pBS) * factor).toFixed(2),
          saldo: +((vBS - pBS - rBS) * factor).toFixed(2),
          sucursalId: suc.id,
        });
      }

      for (const { tipo, debito, credito, alim } of posData) {
        posBatch.push({
          fecha, tipoPos: tipo,
          debito: +(debito * factor).toFixed(2),
          credito: +(credito * factor).toFixed(2),
          alimentacion: +(alim * factor).toFixed(2),
          descuentoTD: +((debito * 0.03) * factor).toFixed(2),
          descuentoTDC: +((credito * 0.05) * factor).toFixed(2),
          descuentoAlim: +((alim * 0.02) * factor).toFixed(2),
          sucursalId: suc.id,
        });
      }

      for (const eg of egresosData) {
        egresosBatch.push({
          fecha, categoria: eg.categoria,
          descripcion: eg.descripcion,
          monto: +(eg.monto * factor).toFixed(2),
          sucursalId: suc.id,
        });
      }

      ingresosBatch.push({
        fecha,
        descripcion: variedades[dia % variedades.length],
        monto: +((80 + (dia % 5) * 50) * factor).toFixed(2),
        sucursalId: suc.id,
      });

      prestamosBatch.push({
        fecha,
        descripcion: dia % 2 === 0 ? "Préstamo a empleado" : "Préstamo a tercero",
        monto: +((300 + (dia % 4) * 200) * factor).toFixed(2),
        sucursalId: suc.id,
      });

      const ingresosTotal = totalUSD(dia) * tasa + totalBS(dia);
      const salidasTotal = totalEgresos(dia);
      cuadresBatch.push({
        fecha, fondoInicial: 1000,
        ingresosTotal: +ingresosTotal.toFixed(2),
        salidasTotal: +salidasTotal.toFixed(2),
        totalCaja: +(1000 + ingresosTotal - salidasTotal).toFixed(2),
        sucursalId: suc.id,
      });
    }
  }

  // Ejecutar batches
  const batchSize = 500;
  async function batchInsert<T>(name: string, data: T[], fn: (batch: T[]) => Promise<any>) {
    for (let i = 0; i < data.length; i += batchSize) {
      await fn(data.slice(i, i + batchSize));
    }
    console.log(`  ✅ ${name} (${data.length} registros)`);
  }

  await batchInsert("Tasas de cambio", tasasBatch, (b) =>
    prisma.tasaCambio.createMany({ data: b, skipDuplicates: true }));

  await batchInsert("Operaciones diarias", opsBatch, (b) =>
    prisma.operacionDiaria.createMany({ data: b, skipDuplicates: true }));

  await batchInsert("POS Movimientos", posBatch, (b) =>
    prisma.pOSMovimiento.createMany({ data: b, skipDuplicates: true }));

  await batchInsert("Egresos", egresosBatch, (b) =>
    prisma.egreso.createMany({ data: b }));

  await batchInsert("Ingresos extra", ingresosBatch, (b) =>
    prisma.ingresoExtra.createMany({ data: b }));

  await batchInsert("Préstamos", prestamosBatch, (b) =>
    prisma.prestamo.createMany({ data: b }));

  await batchInsert("Cuadres de caja", cuadresBatch, (b) =>
    prisma.cuadreCaja.createMany({ data: b, skipDuplicates: true }));

  console.log("\n📊 Resumen:");
  console.log(`  • 30 días × 2 sucursales = completado`);
  console.log(`  • ${productosBase.length} productos por sucursal`);
  console.log(`  • Tasas de cambio diarias: 25.00 → 28.00`);
  console.log(`  • Factor comercial: ${factorDiario(1)} (día 1) → ${factorDiario(30)} (día 30)`);
  console.log(`\n🎉 Demo fill completado!`);
  console.log(`📧 admin@admin.com / admin123 (GERENTE)`);
  console.log(`📧 carlos@pikos.com / admin123 (ENCARGADO Central)`);
  console.log(`📧 maria@pikos.com / admin123 (ENCARGADO Este)`);
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
