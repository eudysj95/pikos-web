"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/operaciones", label: "Operación Diaria", icon: "📝" },
  { href: "/pos-movimientos", label: "POS Movimientos", icon: "💳" },
  { href: "/sucursales", label: "Sucursales", icon: "🏢", adminOnly: true },
  { href: "/usuarios", label: "Usuarios", icon: "👥", adminOnly: true },
  { href: "/plan-cuentas", label: "Plan de Cuentas", icon: "📋" },
  { href: "/egresos", label: "Egresos", icon: "💰" },
  { href: "/ingresos", label: "Ingresos Extras", icon: "📈" },
  { href: "/prestamos", label: "Préstamos", icon: "🏦" },
  { href: "/inventario", label: "Inventario", icon: "📦" },
  { href: "/reportes", label: "Reportes", icon: "📊" },
  { href: "/cuadre-caja", label: "Cuadre de Caja", icon: "check" },
  { href: "/tasa-cambio", label: "Tasa de Cambio", icon: "exchange" },
];

const icons: Record<string, React.ReactNode> = {
  check: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  exchange: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  logout: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

export default function Sidebar({
  rol,
  sucursalNombre,
  userName,
}: {
  rol: string;
  sucursalNombre: string | null;
  userName: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col min-h-screen">
      <div className="p-5 border-b border-slate-700 shrink-0">
        <h1 className="text-xl font-bold">PIKOS</h1>
        <p className="text-sm text-slate-400 mt-1">{userName}</p>
        {sucursalNombre && (
          <p className="text-xs text-slate-500">{sucursalNombre}</p>
        )}
        <span className={cn(
          "inline-block text-xs px-2 py-0.5 rounded mt-1",
          rol === "GERENTE" ? "bg-purple-600" : "bg-blue-600"
        )}>
          {rol === "GERENTE" ? "Gerente" : "Encargado"}
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems
          .filter((item) => !item.adminOnly || rol === "GERENTE")
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                pathname === item.href
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              )}
            >
              <span className="w-5 shrink-0 flex items-center justify-center">
                {icons[item.icon] ?? item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
      </nav>

      <div className="p-3 border-t border-slate-700 shrink-0">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-600/20 hover:text-red-400 w-full transition-colors"
        >
          <span className="w-5 shrink-0 flex items-center justify-center">
            {icons.logout}
          </span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
