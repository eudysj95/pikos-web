# PIKOS Web — Sistema de Gestión Multi-Sucursal

Aplicación web para la gestión de centros de apuestas con soporte multi-sucursal, moneda dual (USD/Bs.) y control de inventario.

**Stack**: Next.js 16 + TypeScript + Tailwind CSS v4 + Prisma + PostgreSQL (Supabase) + NextAuth v5

## Requisitos

- Node.js 20+
- npm/pnpm
- Una base de datos PostgreSQL (Supabase recomendado)

## Configuración

1. Clonar el repositorio e instalar dependencias:

```bash
npm install
# o
pnpm install
```

2. Configurar variables de entorno — copiar los valores correctos en `.env`:

```env
# Base de datos — PostgreSQL en Supabase
# Runtime: pooler transacción (IPv4) en puerto 6543
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres"

# Migraciones: pooler sesión (IPv4) en puerto 5432
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:5432/postgres"

# NextAuth v5 — generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_SECRET="tu-secreto-aqui"

# URL base (para desarrollo)
AUTH_URL="http://localhost:3000"
```

3. Sincronizar esquema y poblar la base de datos:

```bash
npx prisma db push    # Sincroniza el schema
npx prisma db seed    # Carga datos de prueba
```

4. Iniciar el servidor de desarrollo:

```bash
npm run dev
# Abrir http://localhost:3000
```

## Datos de prueba

| Email | Contraseña | Rol |
|---|---|---|
| admin@admin.com | admin123 | GERENTE |
| carlos@pikos.com | admin123 | ENCARGADO |

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/          # Login, registro
│   ├── (dashboard)/     # Páginas protegidas
│   │   ├── cuadre-caja/
│   │   ├── egresos/
│   │   ├── ingresos/
│   │   ├── inventario/
│   │   ├── operaciones/
│   │   ├── plan-cuentas/
│   │   ├── pos-movimientos/
│   │   ├── prestamos/
│   │   ├── reportes/
│   │   ├── sucursales/
│   │   ├── tasa-cambio/
│   │   └── usuarios/
│   └── api/             # REST endpoints
├── components/          # Componentes reutilizables
├── lib/                 # Utilidades, auth, prisma
├── middleware.ts        # Protección de rutas
└── types/               # Tipos TypeScript
```

## Funcionalidades

- **Autenticación**: Email/contraseña con NextAuth v5, JWT, RBAC (GERENTE/ENCARGADO)
- **Multi-sucursal**: Cada sucursal con sus propios datos; gerente ve todo consolidado
- **Moneda dual**: USD/Bs. con tasa de cambio diaria configurable (manual o BCV automático)
- **Operaciones diarias**: 14 tipos de juegos con ventas, pagos, reintegros y comisiones
- **POS**: Registro de movimientos de punto de venta con descuentos automáticos
- **Inventario**: Control de stock con precios en USD y Bs. dinámico
- **Cuadre de caja**: Cierre diario con detección de descuadres
- **Reportes**: Dashboard con filtros por fecha y sucursal
- **BCV automático**: Función serverless que obtiene la tasa del BCV diariamente

## Despliegue

El proyecto está configurado para desplegarse en **Netlify** (auto-deploy desde GitHub).

### Variables de entorno en Netlify

Configurar como **secretos** (production):

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Pooler transacción (puerto 6543) |
| `DIRECT_URL` | Pooler sesión (puerto 5432) |
| `AUTH_SECRET` | Secreto para JWT de NextAuth |
| `AUTH_URL` | URL del sitio en producción |

## Licencia

Uso interno.
