import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function hoy(offset = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.movimientoStock.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.cuadreCaja.deleteMany();
  await prisma.prestamo.deleteMany();
  await prisma.ingresoExtra.deleteMany();
  await prisma.egreso.deleteMany();
  await prisma.pOSMovimiento.deleteMany();
  await prisma.operacionDiaria.deleteMany();
  await prisma.tasaCambio.deleteMany();
  await prisma.planCuenta.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.sucursal.deleteMany();
  console.log("  🧹 Datos anteriores eliminados");

  const passwordHash = await bcrypt.hash("admin123", 10);

  const central = await prisma.sucursal.create({
    data: { nombre: "Sucursal Central", direccion: "Av. Principal, Local 1", telefono: "0212-5550001" },
  });

  const este = await prisma.sucursal.create({
    data: { nombre: "Sucursal Este", direccion: "Calle 5, CC Plaza", telefono: "0212-5550002", activa: false },
  });

  console.log("  ✅ Sucursales");

  await prisma.usuario.createMany({
    data: [
      { nombre: "Admin Gerente", email: "admin@admin.com", passwordHash, rol: "GERENTE", activo: true },
      { nombre: "Carlos Encargado", email: "carlos@pikos.com", passwordHash, rol: "ENCARGADO", sucursalId: central.id, activo: true },
    ],
  });

  console.log("  ✅ Usuarios");

  // ─── TASAS ──────────────────────────────────────────────
  await prisma.tasaCambio.createMany({
    data: [
      { fecha: hoy(-3), tasa: 25.50, sucursalId: central.id },
      { fecha: hoy(-2), tasa: 26.00, sucursalId: central.id },
      { fecha: hoy(-1), tasa: 26.59, sucursalId: central.id },
    ],
  });
  console.log("  ✅ Tasas de Cambio");

  // ─── PLAN DE CUENTAS ────────────────────────────────────
  await prisma.planCuenta.createMany({
    data: [
      { codigo: "1.1.01.001", descripcion: "Caja", tipo: "ACTIVO", sucursalId: central.id },
      { codigo: "1.1.01.002", descripcion: "Banco Provincial", tipo: "ACTIVO", sucursalId: central.id },
      { codigo: "2.1.01.001", descripcion: "Proveedores", tipo: "PASIVO", sucursalId: central.id },
      { codigo: "3.1.01.001", descripcion: "Capital", tipo: "PATRIMONIO", sucursalId: central.id },
      { codigo: "4.1.01.001", descripcion: "Ingresos por Juegos", tipo: "INGRESO", sucursalId: central.id },
      { codigo: "4.1.02.001", descripcion: "Comisiones", tipo: "INGRESO", sucursalId: central.id },
      { codigo: "5.1.01.001", descripcion: "Sueldos", tipo: "EGRESO", sucursalId: central.id },
      { codigo: "5.1.02.001", descripcion: "Alquiler", tipo: "EGRESO", sucursalId: central.id },
      { codigo: "5.1.03.001", descripcion: "Servicios", tipo: "EGRESO", sucursalId: central.id },
    ],
  });
  console.log("  ✅ Plan de Cuentas");

  // ─── PRODUCTOS ──────────────────────────────────────────
  const polar = await prisma.producto.create({ data: { nombre: "Polar Pilsen 330ml", precioUSD: 1.50, precioBS: 40, stockMinimo: 50, categoria: "CERVEZAS", sucursalId: central.id } });
  const coca = await prisma.producto.create({ data: { nombre: "Coca Cola Personal", precioUSD: 1.00, precioBS: 25, stockMinimo: 40, categoria: "BEBIDAS", sucursalId: central.id } });
  const lays = await prisma.producto.create({ data: { nombre: "Papas Lays 50g", precioUSD: 0.75, precioBS: 18, stockMinimo: 30, categoria: "SNACKS", sucursalId: central.id } });

  // stock inicial y movimientos
  await prisma.movimientoStock.create({ data: { fecha: hoy(-3), productoId: polar.id, tipo: "ENTRADA", cantidad: 100, stockAnterior: 0, stockNuevo: 100, sucursalId: central.id } });
  await prisma.movimientoStock.create({ data: { fecha: hoy(-2), productoId: polar.id, tipo: "SALIDA", cantidad: 30, stockAnterior: 100, stockNuevo: 70, sucursalId: central.id } });
  await prisma.movimientoStock.create({ data: { fecha: hoy(-1), productoId: polar.id, tipo: "SALIDA", cantidad: 15, stockAnterior: 70, stockNuevo: 55, sucursalId: central.id } });
  await prisma.movimientoStock.create({ data: { fecha: hoy(-1), productoId: polar.id, tipo: "AJUSTE", cantidad: 60, stockAnterior: 55, stockNuevo: 60, sucursalId: central.id, observacion: "Ajuste por inventario físico" } });
  // Stock actual de Polar: 60
  // stock mínimo: 50 → está cerca del límite

  await prisma.movimientoStock.create({ data: { fecha: hoy(-3), productoId: coca.id, tipo: "ENTRADA", cantidad: 80, stockAnterior: 0, stockNuevo: 80, sucursalId: central.id } });
  await prisma.movimientoStock.create({ data: { fecha: hoy(-2), productoId: coca.id, tipo: "SALIDA", cantidad: 20, stockAnterior: 80, stockNuevo: 60, sucursalId: central.id } });
  // Stock actual de Coca: 60

  await prisma.movimientoStock.create({ data: { fecha: hoy(-3), productoId: lays.id, tipo: "ENTRADA", cantidad: 50, stockAnterior: 0, stockNuevo: 50, sucursalId: central.id } });
  await prisma.movimientoStock.create({ data: { fecha: hoy(-1), productoId: lays.id, tipo: "SALIDA", cantidad: 35, stockAnterior: 50, stockNuevo: 15, sucursalId: central.id } });
  // Stock actual de Lays: 15, stock mínimo: 30 → ROJO (debajo del mínimo)

  console.log("  ✅ Productos y Stock");

  // ─── OPERACIONES DIARIAS ────────────────────────────────
  // Fórmula: saldo = ventas - pagos - reintegros
  //          comision = ventas - pagos  (ingreso bruto antes de reintegros)
  //
  // DATOS FIJOS para verificar fácilmente:
  // =======================================
  // NACIONALES:     USD v=1000 p=600  r=20  → com=400  saldo=380
  //                 BS  v=5000 p=3000 r=100 → com=2000 saldo=1900
  // BARRA:          USD v=800  p=500  r=0   → com=300  saldo=300
  //                 BS  v=4000 p=2500 r=0   → com=1500 saldo=1500
  // INMEJORABLE:    USD v=600  p=200  r=10  → com=400  saldo=390
  //                 BS  v=3000 p=1000 r=50  → com=2000 saldo=1950
  // PARLEY:         USD v=500  p=400  r=5   → com=100  saldo=95
  //                 BS  v=2500 p=2000 r=25  → com=500  saldo=475
  // TABLAS_FIJAS:   USD v=400  p=250  r=0   → com=150  saldo=150
  //                 BS  v=2000 p=1250 r=0   → com=750  saldo=750
  // CASA_GRANDE:    USD v=300  p=180  r=0   → com=120  saldo=120
  //                 BS  v=1500 p=900  r=0   → com=600  saldo=600
  // SIST_AG_ANIM:   USD v=700  p=350  r=15  → com=350  saldo=335
  //                 BS  v=3500 p=1750 r=75  → com=1750 saldo=1675
  // SIST_AG_TRIP:   USD v=650  p=300  r=10  → com=350  saldo=340
  //                 BS  v=3250 p=1500 r=50  → com=1750 saldo=1700
  // PREMIER_PLUS:   USD v=450  p=250  r=5   → com=200  saldo=195
  //                 BS  v=2250 p=1250 r=25  → com=1000 saldo=975
  // MATRIX_ANIM:    USD v=350  p=200  r=0   → com=150  saldo=150
  //                 BS  v=1750 p=1000 r=0   → com=750  saldo=750
  // MATRIX_TRIP:    USD v=550  p=300  r=0   → com=250  saldo=250
  //                 BS  v=2750 p=1500 r=0   → com=1250 saldo=1250
  // RACESAPP_HIP:   USD v=900  p=700  r=30  → com=200  saldo=170
  //                 BS  v=4500 p=3500 r=150 → com=1000 saldo=850
  // RACESAPP_REC:   USD v=200  p=50   r=0   → com=150  saldo=150
  //                 BS  v=1000 p=250  r=0   → com=750  saldo=750
  // CINCO_Y_SEIS:   USD v=300  p=150  r=5   → com=150  saldo=145
  //                 BS  v=1500 p=750  r=25  → com=750  saldo=725
  //
  // TOTALES USD:    v=7700  p=4330  r=100  → com=3370 saldo=3270
  // TOTALES BS:     v=38500 p=21650 r=500  → com=16850 saldo=16350

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

  // Crear ops para los últimos 3 días (hoy, ayer, anteayer)
  for (const offset of [0, -1, -2]) {
    const factor = offset === 0 ? 1.0 : offset === -1 ? 0.8 : 0.6;
    for (const [juego, vUSD, pUSD, rUSD, vBS, pBS, rBS] of ops) {
      await prisma.operacionDiaria.create({ data: { fecha: hoy(offset), tipoJuego: juego, moneda: "USD", ventas: vUSD * factor, pagos: pUSD * factor, reintegros: rUSD * factor, comision: (vUSD - pUSD) * factor, saldo: (vUSD - pUSD - rUSD) * factor, sucursalId: central.id } });
      await prisma.operacionDiaria.create({ data: { fecha: hoy(offset), tipoJuego: juego, moneda: "BS", ventas: vBS * factor, pagos: pBS * factor, reintegros: rBS * factor, comision: (vBS - pBS) * factor, saldo: (vBS - pBS - rBS) * factor, sucursalId: central.id } });
    }
  }

  console.log("  ✅ Operaciones Diarias (14 juegos × 2 monedas × 3 días = 84)");
  console.log("     Verificar: Nacionales USD → ventas=1000 pagos=600 reintegros=20 → comision=400 saldo=380");

  // ─── POS ────────────────────────────────────────────────
  // descuentoTD = debito × 3%, descuentoTDC = credito × 5%, descuentoAlim = alimentacion × 2%
  const posData = [
    { tipo: "PROVINCIAL",     debito: 2000, credito: 1500, alim: 300 },
    { tipo: "BANESCO_ABAJO",  debito: 1500, credito: 1000, alim: 200 },
    { tipo: "BANESCO_ARRIBA", debito: 1000, credito: 800,  alim: 100 },
    { tipo: "TAQUILLA",       debito: 3000, credito: 2000, alim: 0 },
    { tipo: "BARRA",          debito: 500,  credito: 300,  alim: 400 },
  ];

  for (const offset of [0, -1]) {
    for (const { tipo, debito, credito, alim } of posData) {
      await prisma.pOSMovimiento.create({
        data: {
          fecha: hoy(offset), tipoPos: tipo,
          debito, credito, alimentacion: alim,
          descuentoTD: +(debito * 0.03).toFixed(2),
          descuentoTDC: +(credito * 0.05).toFixed(2),
          descuentoAlim: +(alim * 0.02).toFixed(2),
          sucursalId: central.id,
        },
      });
    }
  }

  console.log("  ✅ POS Movimientos (5 tipos × 2 días = 10)");
  console.log("     Provincial debito=2000 → desc. TD=60");

  // ─── EGRESOS ────────────────────────────────────────────
  for (const offset of [0, -1]) {
    await prisma.egreso.createMany({
      data: [
        { fecha: hoy(offset), categoria: "COSTOS", descripcion: "Compra de cervezas", monto: 350.00, sucursalId: central.id },
        { fecha: hoy(offset), categoria: "PERSONAL", descripcion: "Sueldo cajero", monto: 1200.00, sucursalId: central.id },
        { fecha: hoy(offset), categoria: "FUNCIONAMIENTO", descripcion: "Electricidad", monto: 250.00, sucursalId: central.id },
        { fecha: hoy(offset), categoria: "COSTOS", descripcion: "Compra de hielo", monto: 80.00, sucursalId: central.id },
      ],
    });
  }
  console.log("  ✅ Egresos (4 categorías × 2 días = 8 registros)");

  // ─── INGRESOS EXTRAS ────────────────────────────────────
  for (const offset of [0, -1]) {
    await prisma.ingresoExtra.create({ data: { fecha: hoy(offset), descripcion: "Venta de chatarra", monto: 150.00, sucursalId: central.id } });
    await prisma.prestamo.create({ data: { fecha: hoy(offset), descripcion: "Préstamo a Pedro", monto: 500.00, sucursalId: central.id } });
  }
  console.log("  ✅ Ingresos Extras y Préstamos (× 2 días)");

  // ─── CUADRE DE CAJA ─────────────────────────────────────
  // Hoy: fondo=1000 + ingresos=19270 - salidas=1880 = 18390 (✅ cuadrado)
  // Ayer: fondo=1000 + ingresos=15416 - salidas=1504 = 14912 (❌ descuadrado -50)
  await prisma.cuadreCaja.create({ data: { fecha: hoy(0), sucursalId: central.id, fondoInicial: 1000, ingresosTotal: 19270, salidasTotal: 1880, totalCaja: 18390 } });
  await prisma.cuadreCaja.create({ data: { fecha: hoy(-1), sucursalId: central.id, fondoInicial: 1000, ingresosTotal: 15416, salidasTotal: 1504, totalCaja: 14912 } });
  console.log("  ✅ Cuadre de Caja");
  console.log("     Hoy → fondo=1000 + ingresos=19270 - salidas=1880 = 18390 (✅ cuadrado)");
  console.log("     Ayer → fondo=1000 + ingresos=15416 - salidas=1504 = 14912 (❌ descuadrado -50)");

  console.log("\n🎉 Seed completado!");
  console.log("═══════════════════════════════════════════");
  console.log("📧 admin@admin.com / admin123 (GERENTE)");
  console.log("📧 carlos@pikos.com / admin123 (ENCARGADO Central)");
  console.log("═══════════════════════════════════════════");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
