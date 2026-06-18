"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Producto = { id: string; nombre: string; precioUSD: number; precioBS: number; stockMinimo: number; categoria: string; stockActual: number };
type Movimiento = { id: string; fecha: string; tipo: string; cantidad: number; stockAnterior: number; stockNuevo: number; observacion: string | null; producto: { nombre: string } };
type Sucursal = { id: string; nombre: string };

const CATEGORIAS = ["CERVEZAS", "BEBIDAS", "SNACKS", "PROMOS", "OTROS"];

export default function InventarioClient({ sucursales, isGerente, userSucursalId }: { sucursales: Sucursal[]; isGerente: boolean; userSucursalId: string }) {
  const router = useRouter();
  const [sucursalFiltro, setSucursalFiltro] = useState(userSucursalId);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showMovForm, setShowMovForm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"productos" | "movimientos">("productos");

  const [prodForm, setProdForm] = useState({ nombre: "", precioUSD: "", precioBS: "", stockMinimo: "0", categoria: "OTROS" });
  const [movForm, setMovForm] = useState({ tipo: "ENTRADA", cantidad: "", observacion: "" });

  const loadProductos = useCallback(async () => {
    const params = new URLSearchParams();
    if (sucursalFiltro) params.set("sucursalId", sucursalFiltro);
    const res = await globalThis.fetch(`/api/productos?${params}`);
    if (res.ok) setProductos(await res.json());
  }, [sucursalFiltro]);

  const loadMovimientos = useCallback(async () => {
    const params = new URLSearchParams();
    if (sucursalFiltro) params.set("sucursalId", sucursalFiltro);
    const res = await globalThis.fetch(`/api/movimientos-stock?${params}`);
    if (res.ok) setMovimientos(await res.json());
  }, [sucursalFiltro]);

  useEffect(() => { loadProductos(); }, [loadProductos]);
  useEffect(() => { if (tab === "movimientos") loadMovimientos(); }, [tab, loadMovimientos]);

  async function handleProdSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await globalThis.fetch("/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: prodForm.nombre, precioUSD: parseFloat(prodForm.precioUSD) || 0, precioBS: parseFloat(prodForm.precioBS) || 0, stockMinimo: parseInt(prodForm.stockMinimo) || 0, categoria: prodForm.categoria }),
    });
    if (res.ok) { setShowProductForm(false); setProdForm({ nombre: "", precioUSD: "", precioBS: "", stockMinimo: "0", categoria: "OTROS" }); loadProductos(); router.refresh(); }
    setLoading(false);
  }

  async function handleMovSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!showMovForm) return;
    setLoading(true);
    const res = await globalThis.fetch("/api/movimientos-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productoId: showMovForm, tipo: movForm.tipo, cantidad: parseInt(movForm.cantidad) || 0, observacion: movForm.observacion || undefined, sucursalId: sucursalFiltro || undefined }),
    });
    if (res.ok) { setShowMovForm(null); setMovForm({ tipo: "ENTRADA", cantidad: "", observacion: "" }); loadProductos(); loadMovimientos(); router.refresh(); }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 items-end mb-6">
        {isGerente && <div><label className="block text-sm font-medium text-slate-700 mb-1">Sucursal</label>
          <select value={sucursalFiltro} onChange={(e) => setSucursalFiltro(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="">Todas</option>{sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select></div>}
        <div className="flex gap-2">
          <button onClick={() => setTab("productos")} className={`px-4 py-2 rounded-lg text-sm ${tab === "productos" ? "bg-slate-800 text-white" : "bg-white border text-slate-600"}`}>Productos</button>
          <button onClick={() => { setTab("movimientos"); loadMovimientos(); }} className={`px-4 py-2 rounded-lg text-sm ${tab === "movimientos" ? "bg-slate-800 text-white" : "bg-white border text-slate-600"}`}>Movimientos</button>
        </div>
      </div>

      {tab === "productos" && (
        <div>
          <button onClick={() => { setShowProductForm(!showProductForm); setProdForm({ nombre: "", precioUSD: "", precioBS: "", stockMinimo: "0", categoria: "OTROS" }); }}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">{showProductForm ? "Cancelar" : "Nuevo Producto"}</button>

          {showProductForm && (
            <form onSubmit={handleProdSubmit} className="mb-6 p-4 bg-white rounded-xl border space-y-3 max-w-md">
              <input value={prodForm.nombre} onChange={(e) => setProdForm({ ...prodForm, nombre: e.target.value })} placeholder="Nombre del producto" required className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="0.01" value={prodForm.precioUSD} onChange={(e) => setProdForm({ ...prodForm, precioUSD: e.target.value })} placeholder="Precio USD" className="px-3 py-2 border rounded-lg text-sm" />
                <input type="number" step="0.01" value={prodForm.precioBS} onChange={(e) => setProdForm({ ...prodForm, precioBS: e.target.value })} placeholder="Precio Bs." className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={prodForm.stockMinimo} onChange={(e) => setProdForm({ ...prodForm, stockMinimo: e.target.value })} placeholder="Stock mínimo" className="px-3 py-2 border rounded-lg text-sm" />
                <select value={prodForm.categoria} onChange={(e) => setProdForm({ ...prodForm, categoria: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm disabled:opacity-50">{loading ? "Guardando..." : "Crear Producto"}</button>
            </form>
          )}

          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr>
                <th className="text-left p-3 font-medium text-slate-600">Producto</th>
                <th className="text-left p-3 font-medium text-slate-600">Categoría</th>
                <th className="text-right p-3 font-medium text-slate-600">Precio USD</th>
                <th className="text-right p-3 font-medium text-slate-600">Precio Bs.</th>
                <th className="text-right p-3 font-medium text-slate-600">Stock</th>
                <th className="text-right p-3 font-medium text-slate-600">Stock Mín.</th>
                <th className="text-center p-3 font-medium text-slate-600">Acción</th>
              </tr></thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id} className={`border-t hover:bg-slate-50 ${p.stockActual <= p.stockMinimo ? "bg-red-50" : ""}`}>
                    <td className="p-3 font-medium">{p.nombre}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs">{p.categoria}</span></td>
                    <td className="p-3 text-right font-mono">${p.precioUSD.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono">Bs. {p.precioBS.toFixed(2)}</td>
                    <td className={`p-3 text-right font-mono font-bold ${p.stockActual <= p.stockMinimo ? "text-red-600" : ""}`}>{p.stockActual}</td>
                    <td className="p-3 text-right text-slate-500">{p.stockMinimo}</td>
                    <td className="p-3 text-center">
                      {showMovForm === p.id ? (
                        <form onSubmit={handleMovSubmit} className="flex gap-2 items-center justify-center">
                          <select value={movForm.tipo} onChange={(e) => setMovForm({ ...movForm, tipo: e.target.value })} className="px-2 py-1 border rounded text-xs">
                            <option value="ENTRADA">+Entrada</option>
                            <option value="SALIDA">-Salida</option>
                            <option value="AJUSTE">=Ajuste</option>
                          </select>
                          <input type="number" value={movForm.cantidad} onChange={(e) => setMovForm({ ...movForm, cantidad: e.target.value })} placeholder="Cant." className="w-16 px-2 py-1 border rounded text-xs text-right" required />
                          <button type="submit" disabled={loading} className="px-2 py-1 bg-green-600 text-white rounded text-xs">OK</button>
                          <button type="button" onClick={() => setShowMovForm(null)} className="px-2 py-1 bg-slate-300 rounded text-xs">X</button>
                        </form>
                      ) : (
                        <button onClick={() => setShowMovForm(p.id)} className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Movimiento</button>
                      )}
                    </td>
                  </tr>
                ))}
                {productos.length === 0 && <tr><td colSpan={7} className="text-center text-slate-400 py-8">Sin productos registrados</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "movimientos" && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>
              <th className="text-left p-3 font-medium text-slate-600">Fecha</th>
              <th className="text-left p-3 font-medium text-slate-600">Producto</th>
              <th className="text-center p-3 font-medium text-slate-600">Tipo</th>
              <th className="text-right p-3 font-medium text-slate-600">Cantidad</th>
              <th className="text-right p-3 font-medium text-slate-600">Stock Ant.</th>
              <th className="text-right p-3 font-medium text-slate-600">Stock Nuevo</th>
              <th className="text-left p-3 font-medium text-slate-600">Observación</th>
            </tr></thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 text-xs text-slate-500">{new Date(m.fecha).toLocaleString("es-VE")}</td>
                  <td className="p-3 font-medium">{m.producto.nombre}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${m.tipo === "ENTRADA" ? "bg-green-100 text-green-700" : m.tipo === "SALIDA" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono">{m.cantidad}</td>
                  <td className="p-3 text-right font-mono text-slate-500">{m.stockAnterior}</td>
                  <td className="p-3 text-right font-mono font-bold">{m.stockNuevo}</td>
                  <td className="p-3 text-slate-500 text-xs">{m.observacion || "-"}</td>
                </tr>
              ))}
              {movimientos.length === 0 && <tr><td colSpan={7} className="text-center text-slate-400 py-8">Sin movimientos</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
