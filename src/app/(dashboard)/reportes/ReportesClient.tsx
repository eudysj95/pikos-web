"use client";

import { useState, useCallback } from "react";
import { useTasa } from "@/lib/currency-context";
import { formatUSD } from "@/lib/format";

type Resumen = {
  sucursal: string;
  operaciones: {
    usd: { ventas: number; pagos: number; comision: number; saldo: number };
    bs: { ventas: number; pagos: number; comision: number; saldo: number };
    porJuego: [string, { ventasUSD: number; pagosUSD: number; ventasBS: number; pagosBS: number }][];
  };
  pos: { debito: number; credito: number; descuentoTD: number; descuentoTDC: number; descuentoAlim: number };
  egresos: { total: number; porCategoria: [string, number][] };
  ingresos: number;
  prestamos: number;
  cuadre: { fondoInicial: number; totalIngresos: number; totalSalidas: number; totalCaja: number } | null;
};

type Sucursal = { id: string; nombre: string };

export default function ReportesClient({ sucursales, isGerente, userSucursalId }: { sucursales: Sucursal[]; isGerente: boolean; userSucursalId: string }) {
  const hoy = new Date().toISOString().split("T")[0];
  const semanaAtras = new Date(Date.now() - 7 * 864e5).toISOString().split("T")[0];
  const mesAtras = new Date(Date.now() - 30 * 864e5).toISOString().split("T")[0];

  const [desde, setDesde] = useState(semanaAtras);
  const [hasta, setHasta] = useState(hoy);
  const [sucursalFiltro, setSucursalFiltro] = useState(userSucursalId);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const tasa = useTasa();

  function setRango(d: string, h: string) { setDesde(d); setHasta(h); }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ desde, hasta });
    if (sucursalFiltro) params.set("sucursalId", sucursalFiltro);
    const res = await globalThis.fetch(`/api/reportes?${params}`);
    if (res.ok) setResumen(await res.json());
    else { const data = await res.json(); setError(data.error || "Error al generar reporte"); }
    setLoading(false);
  }, [desde, hasta, sucursalFiltro]);

  return (
    <div>
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div className="flex gap-1">
          {[
            { label: "Hoy", d: hoy, h: hoy },
            { label: "Semana", d: semanaAtras, h: hoy },
            { label: "Mes", d: mesAtras, h: hoy },
          ].map(({ label, d, h }) => (
            <button key={label} onClick={() => setRango(d, h)}
              className={`px-3 py-2 rounded-lg text-sm ${desde === d && hasta === h ? "bg-slate-800 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"}`}>{label}</button>
          ))}
        </div>
        <div><label className="block text-xs text-slate-500 mb-1">Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="px-2 py-1.5 border rounded text-sm" /></div>
        <div><label className="block text-xs text-slate-500 mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="px-2 py-1.5 border rounded text-sm" /></div>
        {isGerente && <div><label className="block text-xs text-slate-500 mb-1">Sucursal</label>
          <select value={sucursalFiltro} onChange={(e) => setSucursalFiltro(e.target.value)} className="px-2 py-1.5 border rounded text-sm">
            <option value="">Todas</option>{sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select></div>}
        <button onClick={load} disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50">{loading ? "Cargando..." : "Generar Reporte"}</button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {resumen && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-slate-500">Reporte: <strong>{resumen.sucursal}</strong> — {new Date(desde).toLocaleDateString("es-VE")} al {new Date(hasta).toLocaleDateString("es-VE")}</p>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Operaciones por Juego</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-slate-50"><tr>
                  <th className="text-left p-2 font-medium text-slate-600">Juego</th>
                  <th colSpan={2} className="text-center p-2 font-medium text-slate-600 border-x">USD</th>
                  <th colSpan={2} className="text-center p-2 font-medium text-slate-600">Bs.</th>
                </tr></thead>
                <tbody>
                  {resumen.operaciones.porJuego.map(([juego, data]) => (
                    <tr key={juego} className="border-t hover:bg-slate-50">
                      <td className="p-2 font-medium">{juego}</td>
                      <td className="p-2 text-right border-x">{data.ventasUSD.toFixed(2)}<br /><span className="text-xs text-slate-400">{formatUSD(data.ventasUSD, tasa)}</span></td>
                      <td className="p-2 text-right">{data.pagosUSD.toFixed(2)}<br /><span className="text-xs text-slate-400">{formatUSD(data.pagosUSD, tasa)}</span></td>
                      <td className="p-2 text-right">{data.ventasBS.toFixed(2)}</td>
                      <td className="p-2 text-right">{data.pagosBS.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-semibold">
                  <tr className="border-t-2"><td className="p-2">TOTALES</td>
                    <td className="p-2 text-right border-x">{resumen.operaciones.usd.ventas.toFixed(2)}<br /><span className="text-xs text-slate-400">{formatUSD(resumen.operaciones.usd.ventas, tasa)}</span></td>
                    <td className="p-2 text-right">{resumen.operaciones.usd.pagos.toFixed(2)}<br /><span className="text-xs text-slate-400">{formatUSD(resumen.operaciones.usd.pagos, tasa)}</span></td>
                    <td className="p-2 text-right">{resumen.operaciones.bs.ventas.toFixed(2)}</td>
                    <td className="p-2 text-right">{resumen.operaciones.bs.pagos.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 uppercase">Comisión USD</p>
              <p className="text-xl font-bold text-slate-800">${resumen.operaciones.usd.comision.toFixed(2)}</p>
              {tasa && <p className="text-xs text-slate-400">Bs. {(resumen.operaciones.usd.comision * tasa).toFixed(2)}</p>}
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 uppercase">Comisión Bs.</p>
              <p className="text-xl font-bold text-slate-800">Bs. {resumen.operaciones.bs.comision.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 uppercase">Saldo USD</p>
              <p className={`text-xl font-bold ${resumen.operaciones.usd.saldo < 0 ? "text-red-600" : "text-slate-800"}`}>${resumen.operaciones.usd.saldo.toFixed(2)}</p>
              {tasa && <p className="text-xs text-slate-400">Bs. {(resumen.operaciones.usd.saldo * tasa).toFixed(2)}</p>}
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 uppercase">Saldo Bs.</p>
              <p className={`text-xl font-bold ${resumen.operaciones.bs.saldo < 0 ? "text-red-600" : "text-slate-800"}`}>Bs. {resumen.operaciones.bs.saldo.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">POS — Descuentos</h3>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between"><span className="text-slate-500">Débito</span><span className="font-mono">${resumen.pos.debito.toFixed(2)}</span></p>
                <p className="flex justify-between"><span className="text-slate-500">Crédito</span><span className="font-mono">${resumen.pos.credito.toFixed(2)}</span></p>
                <p className="flex justify-between"><span className="text-slate-500">Desc. TD</span><span className="font-mono">${resumen.pos.descuentoTD.toFixed(2)}</span></p>
                <p className="flex justify-between"><span className="text-slate-500">Desc. TDC</span><span className="font-mono">${resumen.pos.descuentoTDC.toFixed(2)}</span></p>
                <p className="flex justify-between"><span className="text-slate-500">Desc. Alim.</span><span className="font-mono">${resumen.pos.descuentoAlim.toFixed(2)}</span></p>
              </div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Egresos</h3>
              <div className="space-y-1 text-sm">
                {resumen.egresos.porCategoria.map(([cat, monto]) => (
                  <p key={cat} className="flex justify-between"><span className="text-slate-500">{cat}</span><span className="font-mono">${monto.toFixed(2)}</span></p>
                ))}
                <p className="flex justify-between pt-2 border-t font-semibold"><span>Total</span><span className="font-mono">${resumen.egresos.total.toFixed(2)}</span></p>
              </div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Otros</h3>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between"><span className="text-slate-500">Ingresos Extras</span><span className="font-mono">${resumen.ingresos.toFixed(2)}</span></p>
                <p className="flex justify-between"><span className="text-slate-500">Préstamos</span><span className="font-mono">${resumen.prestamos.toFixed(2)}</span></p>
              </div>
              {resumen.cuadre && (
                <div className="mt-3 pt-3 border-t">
                  <h4 className="text-xs font-semibold text-slate-600 mb-2">Cuadre de Caja</h4>
                  <div className="space-y-1 text-sm">
                    <p className="flex justify-between"><span className="text-slate-500">Fondo Inicial</span><span className="font-mono">${resumen.cuadre.fondoInicial.toFixed(2)}</span></p>
                    <p className="flex justify-between"><span className="text-slate-500">Total Ingresos</span><span className="font-mono">${resumen.cuadre.totalIngresos.toFixed(2)}</span></p>
                    <p className="flex justify-between"><span className="text-slate-500">Total Salidas</span><span className="font-mono">${resumen.cuadre.totalSalidas.toFixed(2)}</span></p>
                    <p className="flex justify-between pt-1 border-t font-semibold"><span>Caja Final</span><span className="font-mono">${resumen.cuadre.totalCaja.toFixed(2)}</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
