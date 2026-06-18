## Goal
- Desarrollar una aplicación web multi-sucursal (Next.js/TypeScript) que replique la herramienta Excel **PIKOS 11 EN CURSO (2).xlsm** para gestión de centros de apuestas, y desplegarla online en Netlify + Supabase.

## Constraints & Preferences
- **Stack**: Next.js 16 + TypeScript + Tailwind + Prisma + NextAuth.js v5 + bcryptjs + driver adapter `@prisma/adapter-pg` v6.19.3 + `pg` package
- **BD**: PostgreSQL (Supabase, pooler `aws-1-us-west-2`); SQLite abandonado
- **Autenticación**: email/contraseña, RBAC (GERENTE ve todo, ENCARGADO solo su sucursal)
- **Hosting**: Netlify (GitHub auto-deploy)
- **Moneda dual**: USD/Bs. con tasa de cambio diaria configurable, refresco client-side
- **Periodicidad**: diaria con acumulados semanales/mensuales/rango personalizado
- **Sucursales**: cada una con su Plan de Cuentas; gerente acceso consolidado
- **Presupuesto**: $0 (todo gratuito)
- **Precio Bs. en inventario**: calculado dinámicamente como `precioUSD × tasaDelDía`, no guardado fijo

## Progress
### Done
- Migración de PostgreSQL a SQLite local → revertida a PostgreSQL (Supabase), esquema con 14 modelos, push exitoso
- Seed con datos de prueba: 2 sucursales, 2 usuarios, 84 operaciones diarias (14 juegos × 2 monedas × 3 días), POS, egresos, cuadre de caja — fechas relativas a hoy
- 12 páginas de dashboard conectadas a sidebar con visibilidad por rol
- 16 API REST endpoints protegidos por rol
- Sidebar corregida: `min-h-screen` + `overflow-y-auto` en nav, SVGs inline para iconos
- CurrencyProvider + hook `useTasa()` + `useRefreshTasa()` — fetches tasa client-side al montar y expone `refreshTasa()` para actualización inmediata
- `formatUSD(amount, tasa)` helper — muestra "$X / Bs. Y" en gris debajo de cada celda USD
- Dashboard page: cards con ventas/saldo USD + Bs. equivalente + tasa actual
- Operación Diaria, Reportes: mismo patrón en tabla y tarjetas
- Tasa de Cambio: GERENTE ve selector de sucursal, envía `sucursalId` en POST, llama `refreshTasa()` después de guardar
- **Inventario fijo**: default sucursal primer elemento para GERENTE, Precio Bs. dinámico (`precioUSD × tasaDelDía`), form auto-cálculo Bs., POST de stock envía `sucursalId` desde el filtro
- **Error feedback en UI**: banners rojos con mensaje del API en Inventario, TasaCambio, Operaciones, Reportes
- **Middleware → proxy**: archivo renombrado `src/middleware.ts` → `src/proxy.ts`, export `middleware` → `proxy`
- API tasa-cambio acepta `?actual=true` para devolver solo la última tasa
- API movimientos-stock y tasa-cambio aceptan `sucursalId` del body
- Conexión Supabase vía pooler, SSL con `sslmode=no-verify`
- `pg` + `@prisma/adapter-pg` v6.19.3 instalados (compatible con Prisma 6), `@types/pg` devDep
- PrismaClient configurado con driver adapter (`PrismaPg` + `Pool` de `pg`) — sin binario nativo en runtime
- **Postinstall**: `prisma generate && node -e "eliminar .node files de .prisma/client"` — elimina el binario nativo para que Netlify no lo detecte
- `@netlify/plugin-nextjs` dejó de fallar — el fix del driver adapter + postinstall resolvió el error de C++ addons
- GitHub repo: https://github.com/eudysj95/pikos-web (4 commits)

### In Progress
- **Primer deploy exitoso en Netlify** — verificar que la app funciona (login, operaciones, etc.)

### Blocked
- (ninguno)

## Key Decisions
- **SQLite → PostgreSQL (Supabase)** para producción; pooler `aws-1-us-west-2` necesario para conectividad IPv4
- **Driver adapter (`@prisma/adapter-pg`)** en vez de query engine nativo para compatibilidad con serverless de Netlify
- **Postinstall elimina binarios .node** de Prisma después de generar — patrón necesario para Netlify porque su plugin Next.js escanea y bloquea C++ addons
- **Tasa lado cliente**: CurrencyProvider fetchea tasa client-side al montar con `?actual=true` + expone `refreshTasa()`
- **Precio Bs. dinámico**: se calcula como `precioUSD × tasaDelDía` en display
- **Moneda como campo String** en OperacionDiaria en vez de dos columnas separadas
- **Seed destructivo** con fechas relativas a `hoy()` para desarrollo iterativo

## Next Steps
1. **Verificar el deploy en Netlify** — la URL de producción debería estar funcionando
2. **Probar login, operaciones, inventario** desde la URL desplegada
3. **Probar en teléfono** que la app funciona correctamente

## Critical Context
- Excel original (`PIKOS 11 EN CURSO (2).xlsm`) tiene 4 hojas: DOLAR, BSS, INVENTARIO, PLAN DE CUENTAS
- `AUTH_SECRET` requerido por NextAuth v5 — seteado en Netlify como secret
- Pooler host: `aws-1-us-west-2.pooler.supabase.com`; usuario `postgres.[PROJECT_REF]`
- SSL: `sslmode=no-verify` necesario porque Node.js rechaza el certificado self-signed del pooler
- GERENTE tiene `sucursalId = null` en session → rutas aceptan `sucursalId` desde el body
- `DATABASE_URL` (pooler transacción 6543) para runtime, `DIRECT_URL` (pooler sesión 5432) para migraciones
- Variables Netlify requeridas: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` — marcadas como secret
- `@prisma/adapter-pg` v7 NO es compatible con `@prisma/client` v6 — hay que instalar `@prisma/adapter-pg@6.x.x`

## Relevant Files
- `D:\Desarrollo\IA\Pikos\pikos-web`: proyecto Next.js completo
- `prisma/schema.prisma`: 14 modelos PostgreSQL
- `prisma/seed.ts`: seed con fechas relativas y datos fijos
- `src/lib/prisma.ts`: PrismaClient singleton con `PrismaPg` adapter (driver adapter JS puro)
- `src/lib/auth.ts`: NextAuth v5 con Credentials provider
- `src/lib/tasa.ts`: `getTasaDelDia()` utility
- `src/lib/currency-context.tsx`: `CurrencyProvider` + `useTasa()` + `useRefreshTasa()`
- `src/lib/format.ts`: `formatUSD()` y `formatBs()` helpers
- `src/proxy.ts`: protección de rutas (migrado de middleware.ts)
- `src/app/(dashboard)/inventario/InventarioClient.tsx`: precio Bs. dinámico, error feedback
- `package.json`: postinstall que elimina binarios .node de Prisma
