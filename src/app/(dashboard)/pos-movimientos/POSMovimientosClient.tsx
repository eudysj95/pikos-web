"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type POSMov = {
  id: string;
  fecha: string;
  tipoPos: string;
  debito: number;
  credito: number;
  alimentacion: number;
  descuentoTD: number;
  descuentoTDC: number;
  descuentoAlim: number;
};

type TipoPOS = { value: string; label: string };
type Sucursal = { id: string; nombre: string };

export default function POSMovimientosClient({
  tiposPOS,
  sucursales,
  isGerente,
  userSucursalId,
}: {
  tiposPOS: TipoPOS[];
  sucursales: Sucursal[];
  isGerente: boolean;
  userSucursalId: string;
}) {
  const router = useRouter();
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [sucursalFiltro, setSucursalFiltro] = useState(userSucursalId);
  const [movimientos, setMovimientos] = useState<POSMov[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    tipoPos: "",
    debito: "",
    credito: "",
    alimentacion: "0",
    descuentoTD: "0",
    descuentoTDC: "0",
    descuentoAlim: "0",
  });
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ fecha });
    if (sucursalFiltro) params.set("sucursalId", sucursalFiltro);
    const res = await globalThis.fetch(`/api/pos-movimientos?${params}`);
    if (res.ok) setMovimientos(await res.json());
  }, [fecha, sucursalFiltro]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/pos-movimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fecha,
        tipoPos: form.tipoPos,
        debito: parseFloat(form.debito) || 0,
        credito: parseFloat(form.credito) || 0,
        alimentacion: parseFloat(form.alimentacion) || 0,
        descuentoTD: parseFloat(form.descuentoTD) || 0,
        descuentoTDC: parseFloat(form.descuentoTDC) || 0,
        descuentoAlim: parseFloat(form.descuentoAlim) || 0,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ tipoPos: "", debito: "", credito: "", alimentacion: "0", descuentoTD: "0", descuentoTDC: "0", descuentoAlim: "0" });
      load();
      router.refresh();
    }
    setLoading(false);
  }

  const movMap = new Map<string, POSMov>();
  for (const m of movimientos) movMap.set(m.tipoPos, m);

  const totals = { debito: 0, credito: 0, alimentacion: 0, descuentoTD: 0, descuentoTDC: 0, descuentoAlim: 0 };

  return (
    <div>
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm" />
        </div>
        {isGerente && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sucursal</label>
            <select value={sucursalFiltro} onChange={(e) => setSucursalFiltro(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Todas</option>
              {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
        )}
        <button onClick={() => { setShowForm(!showForm); setForm({ tipoPos: "", debito: "", credito: "", alimentacion: "0", descuentoTD: "0", descuentoTDC: "0", descuentoAlim: "0" }); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          {showForm ? "Cancelar" : "Nuevo Movimiento"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-xl border space-y-3 max-w-lg">
          <select value={form.tipoPos} onChange={(e) => setForm({ ...form, tipoPos: e.target.value })}
            required className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">Seleccionar POS</option>
            {tiposPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" step="0.01" value={form.debito} onChange={(e) => setForm({ ...form, debito: e.target.value })}
              placeholder="Débito" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" step="0.01" value={form.credito} onChange={(e) => setForm({ ...form, credito: e.target.value })}
              placeholder="Crédito" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" step="0.01" value={form.alimentacion} onChange={(e) => setForm({ ...form, alimentacion: e.target.value })}
              placeholder="Alimentación" className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" step="0.01" value={form.descuentoTD} onChange={(e) => setForm({ ...form, descuentoTD: e.target.value })}
              placeholder="Desc. TD" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" step="0.01" value={form.descuentoTDC} onChange={(e) => setForm({ ...form, descuentoTDC: e.target.value })}
              placeholder="Desc. TDC" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" step="0.01" value={form.descuentoAlim} onChange={(e) => setForm({ ...form, descuentoAlim: e.target.value })}
              placeholder="Desc. Alim." className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <button type="submit" disabled={loading}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-2 font-medium text-slate-600">POS</th>
              <th className="text-right p-2 font-medium text-slate-600">Débito</th>
              <th className="text-right p-2 font-medium text-slate-600">Crédito</th>
              <th className="text-right p-2 font-medium text-slate-600">Alimentación</th>
              <th className="text-right p-2 font-medium text-slate-600">Desc. TD</th>
              <th className="text-right p-2 font-medium text-slate-600">Desc. TDC</th>
              <th className="text-right p-2 font-medium text-slate-600">Desc. Alim.</th>
            </tr>
          </thead>
          <tbody>
            {tiposPOS.map((tipo) => {
              const m = movMap.get(tipo.value);
              if (m) { totals.debito += m.debito; totals.credito += m.credito; totals.alimentacion += m.alimentacion; totals.descuentoTD += m.descuentoTD; totals.descuentoTDC += m.descuentoTDC; totals.descuentoAlim += m.descuentoAlim; }
              return (
                <tr key={tipo.value} className="border-t hover:bg-slate-50">
                  <td className="p-2 font-medium">{tipo.label}</td>
                  <td className="p-2 text-right font-mono">{m ? m.debito.toFixed(2) : "-"}</td>
                  <td className="p-2 text-right font-mono">{m ? m.credito.toFixed(2) : "-"}</td>
                  <td className="p-2 text-right font-mono">{m ? m.alimentacion.toFixed(2) : "-"}</td>
                  <td className="p-2 text-right font-mono">{m ? m.descuentoTD.toFixed(2) : "-"}</td>
                  <td className="p-2 text-right font-mono">{m ? m.descuentoTDC.toFixed(2) : "-"}</td>
                  <td className="p-2 text-right font-mono">{m ? m.descuentoAlim.toFixed(2) : "-"}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-100 font-semibold">
            <tr className="border-t-2 border-slate-300">
              <td className="p-2">TOTALES</td>
              <td className="p-2 text-right">{totals.debito.toFixed(2)}</td>
              <td className="p-2 text-right">{totals.credito.toFixed(2)}</td>
              <td className="p-2 text-right">{totals.alimentacion.toFixed(2)}</td>
              <td className="p-2 text-right">{totals.descuentoTD.toFixed(2)}</td>
              <td className="p-2 text-right">{totals.descuentoTDC.toFixed(2)}</td>
              <td className="p-2 text-right">{totals.descuentoAlim.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
