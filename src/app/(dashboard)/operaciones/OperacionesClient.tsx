"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTasa } from "@/lib/currency-context";
import { formatUSD } from "@/lib/format";
import { hoyLocal } from "@/lib/date";

type Operacion = {
  id: string;
  fecha: string;
  tipoJuego: string;
  moneda: string;
  ventas: number;
  pagos: number;
  reintegros: number;
  comision: number;
  saldo: number;
  observacion: string | null;
};

type TipoJuego = { value: string; label: string };
type Sucursal = { id: string; nombre: string };

export default function OperacionesClient({
  tiposJuego,
  sucursales,
  isGerente,
  userSucursalId,
}: {
  tiposJuego: TipoJuego[];
  sucursales: Sucursal[];
  isGerente: boolean;
  userSucursalId: string;
}) {
  const router = useRouter();
  const [fecha, setFecha] = useState(hoyLocal());
  const [sucursalFiltro, setSucursalFiltro] = useState(userSucursalId);
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [loading, setLoading] = useState(false);
  const tasa = useTasa();

  const [form, setForm] = useState({
    tipoJuego: "",
    moneda: "USD",
    ventas: "",
    pagos: "",
    reintegros: "0",
    comision: "0",
    observacion: "",
  });
  const [editing, setEditing] = useState<Operacion | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const fetchOperaciones = useCallback(async () => {
    setError("");
    const params = new URLSearchParams({ fecha });
    if (sucursalFiltro) params.set("sucursalId", sucursalFiltro);
    const res = await fetch(`/api/operaciones?${params}`);
    if (res.ok) {
      setOperaciones(await res.json());
    } else {
      const data = await res.json();
      setError(data.error || "Error al cargar operaciones");
    }
  }, [fecha, sucursalFiltro]);

  useEffect(() => { fetchOperaciones(); }, [fetchOperaciones]);

  const ventas = parseFloat(form.ventas) || 0;
  const pagos = parseFloat(form.pagos) || 0;
  const reintegros = parseFloat(form.reintegros) || 0;
  const saldo = ventas - pagos - reintegros;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/operaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fecha,
        tipoJuego: form.tipoJuego,
        moneda: form.moneda,
        ventas,
        pagos,
        reintegros,
        comision: parseFloat(form.comision) || 0,
        observacion: form.observacion || undefined,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ tipoJuego: "", moneda: "USD", ventas: "", pagos: "", reintegros: "0", comision: "0", observacion: "" });
      setEditing(null);
      fetchOperaciones();
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Error al guardar operación");
    }
    setLoading(false);
  }

  function startEdit(op: Operacion) {
    setEditing(op);
    setForm({
      tipoJuego: op.tipoJuego,
      moneda: op.moneda,
      ventas: op.ventas.toString(),
      pagos: op.pagos.toString(),
      reintegros: op.reintegros.toString(),
      comision: op.comision.toString(),
      observacion: op.observacion || "",
    });
    setShowForm(true);
  }

  const opMap = new Map<string, { usd?: Operacion; bs?: Operacion }>();
  for (const op of operaciones) {
    const key = op.tipoJuego;
    if (!opMap.has(key)) opMap.set(key, {});
    opMap.get(key)![op.moneda === "USD" ? "usd" : "bs"] = op;
  }

  const totals = { ventasUSD: 0, pagosUSD: 0, reintegrosUSD: 0, comisionUSD: 0, saldoUSD: 0,
    ventasBS: 0, pagosBS: 0, reintegrosBS: 0, comisionBS: 0, saldoBS: 0 };

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
        <button onClick={() => { setEditing(null); setForm({ tipoJuego: "", moneda: "USD", ventas: "", pagos: "", reintegros: "0", comision: "0", observacion: "" }); setShowForm(!showForm); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          {showForm ? "Cancelar" : "Nueva Operación"}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-xl border space-y-3 max-w-lg">
          <div className="grid grid-cols-2 gap-3">
            <select value={form.tipoJuego} onChange={(e) => setForm({ ...form, tipoJuego: e.target.value })}
              required className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Seleccionar juego</option>
              {tiposJuego.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm">
              <option value="USD">USD</option>
              <option value="BS">Bs.</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" step="0.01" value={form.ventas} onChange={(e) => setForm({ ...form, ventas: e.target.value })}
              placeholder="Ventas" required className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" step="0.01" value={form.pagos} onChange={(e) => setForm({ ...form, pagos: e.target.value })}
              placeholder="Pagos" required className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" step="0.01" value={form.reintegros} onChange={(e) => setForm({ ...form, reintegros: e.target.value })}
              placeholder="Reintegros" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" step="0.01" value={form.comision} onChange={(e) => setForm({ ...form, comision: e.target.value })}
              placeholder="Comisión" className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="text-sm text-slate-500">Saldo calculado: <strong>{saldo.toFixed(2)}</strong></div>
          <input value={form.observacion} onChange={(e) => setForm({ ...form, observacion: e.target.value })}
            placeholder="Observación (opcional)" className="w-full px-3 py-2 border rounded-lg text-sm" />
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
              <th className="text-left p-2 font-medium text-slate-600">Juego</th>
              <th colSpan={4} className="p-2 font-medium text-slate-600 text-center border-x">USD</th>
              <th colSpan={4} className="p-2 font-medium text-slate-600 text-center">Bs.</th>
              <th className="p-2"></th>
            </tr>
            <tr className="border-t">
              <th className="p-2 text-xs text-slate-500 font-medium"></th>
              <th className="p-2 text-xs text-slate-500 font-medium border-x">Ventas</th>
              <th className="p-2 text-xs text-slate-500 font-medium">Pagos</th>
              <th className="p-2 text-xs text-slate-500 font-medium">Comisión</th>
              <th className="p-2 text-xs text-slate-500 font-medium border-r">Saldo</th>
              <th className="p-2 text-xs text-slate-500 font-medium">Ventas</th>
              <th className="p-2 text-xs text-slate-500 font-medium">Pagos</th>
              <th className="p-2 text-xs text-slate-500 font-medium">Comisión</th>
              <th className="p-2 text-xs text-slate-500 font-medium border-r">Saldo</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {tiposJuego.map((tipo) => {
              const entry = opMap.get(tipo.value) || {};
              const usd = entry.usd;
              const bs = entry.bs;
              if (usd) { totals.ventasUSD += usd.ventas; totals.pagosUSD += usd.pagos; totals.reintegrosUSD += usd.reintegros; totals.comisionUSD += usd.comision; totals.saldoUSD += usd.saldo; }
              if (bs) { totals.ventasBS += bs.ventas; totals.pagosBS += bs.pagos; totals.reintegrosBS += bs.reintegros; totals.comisionBS += bs.comision; totals.saldoBS += bs.saldo; }
              return (
                <tr key={tipo.value} className="border-t hover:bg-slate-50">
                  <td className="p-2 font-medium">{tipo.label}</td>
                  <td className="p-2 border-x text-right font-mono">
                    {usd ? <>{usd.ventas.toFixed(2)}<br /><span className="text-xs text-slate-400">{formatUSD(usd.ventas, tasa)}</span></> : "-"}
                  </td>
                  <td className="p-2 text-right font-mono">
                    {usd ? <>{usd.pagos.toFixed(2)}<br /><span className="text-xs text-slate-400">{formatUSD(usd.pagos, tasa)}</span></> : "-"}
                  </td>
                  <td className="p-2 text-right font-mono">
                    {usd ? <>{usd.comision.toFixed(2)}<br /><span className="text-xs text-slate-400">{formatUSD(usd.comision, tasa)}</span></> : "-"}
                  </td>
                  <td className={`p-2 border-r text-right font-mono ${usd && usd.saldo < 0 ? "text-red-600" : ""}`}>
                    {usd ? <>{usd.saldo.toFixed(2)}<br /><span className="text-xs text-slate-400">{formatUSD(usd.saldo, tasa)}</span></> : "-"}
                  </td>
                  <td className="p-2 text-right font-mono">{bs ? bs.ventas.toFixed(2) : "-"}</td>
                  <td className="p-2 text-right font-mono">{bs ? bs.pagos.toFixed(2) : "-"}</td>
                  <td className="p-2 text-right font-mono">{bs ? bs.comision.toFixed(2) : "-"}</td>
                  <td className={`p-2 border-r text-right font-mono ${bs && bs.saldo < 0 ? "text-red-600" : ""}`}>{bs ? bs.saldo.toFixed(2) : "-"}</td>
                  <td className="p-2">
                    {usd && <button onClick={() => startEdit(usd)} className="text-blue-600 hover:underline text-xs mr-1">Editar</button>}
                    {bs && <button onClick={() => startEdit(bs)} className="text-blue-600 hover:underline text-xs">Editar</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-100 font-semibold">
            <tr className="border-t-2 border-slate-300">
              <td className="p-2">TOTALES</td>
              <td className="p-2 border-x text-right">
                {totals.ventasUSD.toFixed(2)}<br /><span className="text-xs text-slate-400">{formatUSD(totals.ventasUSD, tasa)}</span>
              </td>
              <td className="p-2 text-right">
                {totals.pagosUSD.toFixed(2)}<br /><span className="text-xs text-slate-400">{formatUSD(totals.pagosUSD, tasa)}</span>
              </td>
              <td className="p-2 text-right">
                {totals.comisionUSD.toFixed(2)}<br /><span className="text-xs text-slate-400">{formatUSD(totals.comisionUSD, tasa)}</span>
              </td>
              <td className={`p-2 border-r text-right ${totals.saldoUSD < 0 ? "text-red-600" : ""}`}>
                {totals.saldoUSD.toFixed(2)}<br /><span className="text-xs text-slate-400">{formatUSD(totals.saldoUSD, tasa)}</span>
              </td>
              <td className="p-2 text-right">{totals.ventasBS.toFixed(2)}</td>
              <td className="p-2 text-right">{totals.pagosBS.toFixed(2)}</td>
              <td className="p-2 text-right">{totals.comisionBS.toFixed(2)}</td>
              <td className={`p-2 border-r text-right ${totals.saldoBS < 0 ? "text-red-600" : ""}`}>{totals.saldoBS.toFixed(2)}</td>
              <td className="p-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
