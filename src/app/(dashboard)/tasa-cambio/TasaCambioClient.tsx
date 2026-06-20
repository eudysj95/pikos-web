"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRefreshTasa } from "@/lib/currency-context";
import { hoyLocal } from "@/lib/date";

type Tasa = {
  id: string;
  fecha: string;
  tasa: number;
};

type Sucursal = { id: string; nombre: string };

export default function TasaCambioClient({
  tasas: initial,
  sucursales,
  isGerente,
  userSucursalId,
}: {
  tasas: Tasa[];
  sucursales: Sucursal[];
  isGerente: boolean;
  userSucursalId: string;
}) {
  const router = useRouter();
  const refreshTasa = useRefreshTasa();
  const [tasas, setTasas] = useState(initial);
  const [fecha, setFecha] = useState(hoyLocal());
  const [tasa, setTasa] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucursalFiltro, setSucursalFiltro] = useState(userSucursalId);
  const [error, setError] = useState("");

  const loadTasas = useCallback(async () => {
    const params = new URLSearchParams();
    if (sucursalFiltro) params.set("sucursalId", sucursalFiltro);
    const res = await fetch(`/api/tasa-cambio?${params}`);
    if (res.ok) setTasas(await res.json());
  }, [sucursalFiltro]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/tasa-cambio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha, tasa: parseFloat(tasa), sucursalId: sucursalFiltro }),
    });

    if (res.ok) {
      setTasa("");
      loadTasas();
      router.refresh();
      refreshTasa();
    } else {
      const data = await res.json();
      setError(data.error || "Error al guardar tasa");
    }
    setLoading(false);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-xl border space-y-3 max-w-md">
        {isGerente && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sucursal</label>
            <select value={sucursalFiltro} onChange={(e) => setSucursalFiltro(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tasa USD/Bs.
          </label>
          <input
            type="number"
            step="0.01"
            value={tasa}
            onChange={(e) => setTasa(e.target.value)}
            placeholder="ej: 26.59"
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar Tasa"}
        </button>
      </form>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3 font-medium text-slate-600">Fecha</th>
              <th className="text-left p-3 font-medium text-slate-600">Tasa USD/Bs.</th>
            </tr>
          </thead>
          <tbody>
            {tasas.map((t) => (
              <tr key={t.id} className="border-t hover:bg-slate-50">
                <td className="p-3">
                  {new Date(t.fecha).toLocaleDateString("es-VE")}
                </td>
                <td className="p-3 font-mono font-medium">
                  Bs. {t.tasa.toFixed(2)}
                </td>
              </tr>
            ))}
            {tasas.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center text-slate-400 py-8">
                  No hay tasas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
