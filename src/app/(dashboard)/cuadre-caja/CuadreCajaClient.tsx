"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { hoyLocal } from "@/lib/date";

type Cuadre = { id: string; fecha: string; fondoInicial: number; ingresosTotal: number; salidasTotal: number; totalCaja: number };
type Sucursal = { id: string; nombre: string };

export default function CuadreCajaClient({ sucursales, isGerente, userSucursalId }: { sucursales: Sucursal[]; isGerente: boolean; userSucursalId: string }) {
  const router = useRouter();
  const [fecha, setFecha] = useState(hoyLocal());
  const [sucursalFiltro, setSucursalFiltro] = useState(userSucursalId);
  const [cuadre, setCuadre] = useState<Cuadre | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setFecha(hoyLocal()); }, []);

  const [form, setForm] = useState({ fondoInicial: "", ingresosTotal: "", salidasTotal: "", billetes200: "", billetes100: "", billetes50: "", billetes20: "", billetes10: "", billetes5: "", billetes2: "", billetes1: "", monedas: "" });
  const [totalConteo, setTotalConteo] = useState(0);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ fecha });
    if (sucursalFiltro) params.set("sucursalId", sucursalFiltro);
    const res = await globalThis.fetch(`/api/cuadre-caja?${params}`);
    if (res.ok) {
      const data = await res.json();
      setCuadre(data);
      if (data) setForm((prev) => ({ ...prev, fondoInicial: data.fondoInicial.toString(), ingresosTotal: data.ingresosTotal.toString(), salidasTotal: data.salidasTotal.toString() }));
    }
  }, [fecha, sucursalFiltro]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const billetes200 = parseInt(form.billetes200) || 0;
    const billetes100 = parseInt(form.billetes100) || 0;
    const billetes50 = parseInt(form.billetes50) || 0;
    const billetes20 = parseInt(form.billetes20) || 0;
    const billetes10 = parseInt(form.billetes10) || 0;
    const billetes5 = parseInt(form.billetes5) || 0;
    const billetes2 = parseInt(form.billetes2) || 0;
    const billetes1 = parseInt(form.billetes1) || 0;
    const monedas = parseFloat(form.monedas) || 0;

    setTotalConteo(
      billetes200 * 200 + billetes100 * 100 + billetes50 * 50 + billetes20 * 20 +
      billetes10 * 10 + billetes5 * 5 + billetes2 * 2 + billetes1 * 1 + monedas
    );
  }, [form.billetes200, form.billetes100, form.billetes50, form.billetes20, form.billetes10, form.billetes5, form.billetes2, form.billetes1, form.monedas]);

  const fondo = parseFloat(form.fondoInicial) || 0;
  const ingresos = parseFloat(form.ingresosTotal) || 0;
  const salidas = parseFloat(form.salidasTotal) || 0;
  const totalCalculado = fondo + ingresos - salidas;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await globalThis.fetch("/api/cuadre-caja", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha, fondoInicial: fondo, ingresosTotal: ingresos, salidasTotal: salidas, totalCaja: totalConteo }),
    });
    if (res.ok) { load(); router.refresh(); }
    setLoading(false);
  }

  const diferencia = totalCalculado - totalConteo;

  return (
    <div>
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" /></div>
        {isGerente && <div><label className="block text-sm font-medium text-slate-700 mb-1">Sucursal</label>
          <select value={sucursalFiltro} onChange={(e) => setSucursalFiltro(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="">Todas</option>{sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select></div>}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Resumen del Día</h2>
          <div><label className="block text-sm text-slate-600 mb-1">Fondo Inicial</label>
            <input type="number" step="0.01" value={form.fondoInicial} onChange={(e) => setForm({ ...form, fondoInicial: e.target.value })}
              required className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="block text-sm text-slate-600 mb-1">Total Ingresos</label>
            <input type="number" step="0.01" value={form.ingresosTotal} onChange={(e) => setForm({ ...form, ingresosTotal: e.target.value })}
              required className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="block text-sm text-slate-600 mb-1">Total Salidas</label>
            <input type="number" step="0.01" value={form.salidasTotal} onChange={(e) => setForm({ ...form, salidasTotal: e.target.value })}
              required className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="pt-4 border-t">
            <p className="text-sm text-slate-600">Total Calculado: <strong className="text-lg">{totalCalculado.toFixed(2)}</strong></p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Conteo de Efectivo (Bs.)</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "billetes200", label: "Billetes 200", denom: 200 },
              { key: "billetes100", label: "Billetes 100", denom: 100 },
              { key: "billetes50", label: "Billetes 50", denom: 50 },
              { key: "billetes20", label: "Billetes 20", denom: 20 },
              { key: "billetes10", label: "Billetes 10", denom: 10 },
              { key: "billetes5", label: "Billetes 5", denom: 5 },
              { key: "billetes2", label: "Billetes 2", denom: 2 },
              { key: "billetes1", label: "Billetes 1", denom: 1 },
            ].map(({ key, label, denom }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-24">{label}</span>
                <input type="number" value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-20 px-2 py-1.5 border rounded text-sm text-right" />
                <span className="text-xs text-slate-400">= ${((parseInt((form as any)[key]) || 0) * denom).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 w-24">Monedas</span>
            <input type="number" step="0.01" value={form.monedas} onChange={(e) => setForm({ ...form, monedas: e.target.value })}
              className="w-20 px-2 py-1.5 border rounded text-sm text-right" />
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-slate-600">Total Conteo Efectivo: <strong className="text-lg">{totalConteo.toFixed(2)}</strong></p>
            <p className={`text-sm mt-1 ${diferencia === 0 ? "text-green-600" : Math.abs(diferencia) < 5 ? "text-yellow-600" : "text-red-600"}`}>
              Diferencia: <strong>{diferencia.toFixed(2)}</strong>
              {diferencia === 0 ? " ✅ Cuadrado" : Math.abs(diferencia) < 5 ? " ⚠️ Diferencia menor" : " ❌ Descua-drado"}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 flex justify-end">
          <button type="submit" disabled={loading}
            className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 text-sm font-medium">
            {loading ? "Guardando..." : cuadre ? "Actualizar Cuadre" : "Guardar Cuadre"}
          </button>
        </div>
      </form>
    </div>
  );
}
