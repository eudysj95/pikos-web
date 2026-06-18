"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; fecha: string; descripcion: string | null; monto: number };
type Sucursal = { id: string; nombre: string };

export default function MovimientosSimplesClient({
  apiPath, label, sucursales, isGerente, userSucursalId,
}: {
  apiPath: string; label: string; sucursales: Sucursal[]; isGerente: boolean; userSucursalId: string;
}) {
  const router = useRouter();
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [sucursalFiltro, setSucursalFiltro] = useState(userSucursalId);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ descripcion: "", monto: "" });
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ fecha });
    if (sucursalFiltro) params.set("sucursalId", sucursalFiltro);
    const res = await globalThis.fetch(`${apiPath}?${params}`);
    if (res.ok) setItems(await res.json());
  }, [fecha, sucursalFiltro, apiPath]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await globalThis.fetch(apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha, descripcion: form.descripcion, monto: parseFloat(form.monto) }),
    });
    if (res.ok) { setShowForm(false); setForm({ descripcion: "", monto: "" }); load(); router.refresh(); }
    setLoading(false);
  }

  const total = items.reduce((s, i) => s + i.monto, 0);

  return (
    <div>
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" /></div>
        {isGerente && <div><label className="block text-sm font-medium text-slate-700 mb-1">Sucursal</label>
          <select value={sucursalFiltro} onChange={(e) => setSucursalFiltro(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="">Todas</option>{sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select></div>}
        <button onClick={() => { setShowForm(!showForm); setForm({ descripcion: "", monto: "" }); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">{showForm ? "Cancelar" : `Nuevo ${label}`}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-xl border space-y-3 max-w-md">
          <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción" required className="w-full px-3 py-2 border rounded-lg text-sm" />
          <input type="number" step="0.01" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} placeholder="Monto" required className="w-full px-3 py-2 border rounded-lg text-sm" />
          <button type="submit" disabled={loading} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm disabled:opacity-50">{loading ? "Guardando..." : "Guardar"}</button>
        </form>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>
            <th className="text-left p-3 font-medium text-slate-600">Descripción</th>
            <th className="text-right p-3 font-medium text-slate-600">Monto</th>
          </tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t hover:bg-slate-50">
                <td className="p-3 text-slate-600">{i.descripcion || "-"}</td>
                <td className="p-3 text-right font-mono">{i.monto.toFixed(2)}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={2} className="text-center text-slate-400 py-8">Sin registros</td></tr>}
          </tbody>
          <tfoot className="bg-slate-100 font-semibold">
            <tr className="border-t-2"><td className="p-3">TOTAL</td><td className="p-3 text-right">{total.toFixed(2)}</td></tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
