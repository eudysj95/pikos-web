-- CreateTable
CREATE TABLE "sucursales" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'ENCARGADO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "sucursal_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "usuarios_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "plan_cuentas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cuenta_agrupada" TEXT,
    "tipo" TEXT,
    "sucursal_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "plan_cuentas_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tasas_cambio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL,
    "tasa" REAL NOT NULL,
    "sucursal_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tasas_cambio_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "operaciones_diarias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL,
    "tipo_juego" TEXT NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "ventas" REAL NOT NULL DEFAULT 0,
    "pagos" REAL NOT NULL DEFAULT 0,
    "reintegros" REAL NOT NULL DEFAULT 0,
    "comision" REAL NOT NULL DEFAULT 0,
    "saldo" REAL NOT NULL DEFAULT 0,
    "observacion" TEXT,
    "sucursal_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "operaciones_diarias_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pos_movimientos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL,
    "tipo_pos" TEXT NOT NULL,
    "debito" REAL NOT NULL DEFAULT 0,
    "credito" REAL NOT NULL DEFAULT 0,
    "alimentacion" REAL NOT NULL DEFAULT 0,
    "descuento_td" REAL NOT NULL,
    "descuento_tdc" REAL NOT NULL,
    "descuento_alim" REAL NOT NULL,
    "sucursal_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pos_movimientos_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "egresos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL,
    "categoria" TEXT NOT NULL,
    "codigo_cuenta" TEXT,
    "descripcion" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "sucursal_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "egresos_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ingresos_extra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "sucursal_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ingresos_extra_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prestamos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL,
    "descripcion" TEXT,
    "monto" REAL NOT NULL,
    "sucursal_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "prestamos_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cuadres_caja" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL,
    "fondo_inicial" REAL NOT NULL DEFAULT 0,
    "ingresos_total" REAL NOT NULL DEFAULT 0,
    "salidas_total" REAL NOT NULL DEFAULT 0,
    "total_caja" REAL NOT NULL DEFAULT 0,
    "sucursal_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cuadres_caja_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "precio_usd" REAL NOT NULL DEFAULT 0,
    "precio_bs" REAL NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 0,
    "categoria" TEXT NOT NULL DEFAULT 'OTROS',
    "sucursal_id" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "productos_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "movimientos_stock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL,
    "producto_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "stock_anterior" INTEGER NOT NULL,
    "stock_nuevo" INTEGER NOT NULL,
    "observacion" TEXT,
    "sucursal_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "movimientos_stock_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "movimientos_stock_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "sucursales_nombre_key" ON "sucursales"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "plan_cuentas_codigo_sucursal_id_key" ON "plan_cuentas"("codigo", "sucursal_id");

-- CreateIndex
CREATE UNIQUE INDEX "tasas_cambio_fecha_sucursal_id_key" ON "tasas_cambio"("fecha", "sucursal_id");

-- CreateIndex
CREATE UNIQUE INDEX "operaciones_diarias_fecha_tipo_juego_moneda_sucursal_id_key" ON "operaciones_diarias"("fecha", "tipo_juego", "moneda", "sucursal_id");

-- CreateIndex
CREATE UNIQUE INDEX "pos_movimientos_fecha_tipo_pos_sucursal_id_key" ON "pos_movimientos"("fecha", "tipo_pos", "sucursal_id");

-- CreateIndex
CREATE UNIQUE INDEX "cuadres_caja_fecha_sucursal_id_key" ON "cuadres_caja"("fecha", "sucursal_id");

-- CreateIndex
CREATE UNIQUE INDEX "productos_nombre_sucursal_id_key" ON "productos"("nombre", "sucursal_id");
