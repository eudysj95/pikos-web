"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Cuenta = {
  id: string;
  codigo: string;
  descripcion: string;
  tipo: string | null;
  sucursalId: string;
};

type Sucursal = {
  id: string;
  nombre: string;
};

export default function PlanCuentasClient({
  cuentas: initial,
  sucursales,
  isGerente,
  sucursalId: userSucursalId,
}: {
  cuentas: Cuenta[];
  sucursales: Sucursal[];
  isGerente: boolean;
  sucursalId: string;
}) {
  const router = useRouter();
  const [cuentas, setCuentas] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ codigo: "", descripcion: "", tipo: "", sucursalId: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, string> = { codigo: form.codigo, descripcion: form.descripcion, tipo: form.tipo };
    if (form.sucursalId) payload.sucursalId = form.sucursalId;

    const res = await fetch("/api/plan-cuentas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ codigo: "", descripcion: "", tipo: "", sucursalId: "" });
      router.refresh();
      const updated = await fetch("/api/plan-cuentas").then((r) => r.json());
      setCuentas(updated);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta cuenta?")) return;
    await fetch(`/api/plan-cuentas?id=${id}`, { method: "DELETE" });
    router.refresh();
    setCuentas(cuentas.filter((c) => c.id !== id));
  }

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
      >
        {showForm ? "Cancelar" : "Nueva Cuenta"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 bg-white rounded-xl border space-y-3"
        >
          <input
            placeholder="Código (ej: 1.1.01.001)"
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Sin tipo</option>
            <option value="ACTIVO">Activo</option>
            <option value="PASIVO">Pasivo</option>
            <option value="PATRIMONIO">Patrimonio</option>
            <option value="INGRESO">Ingreso</option>
            <option value="EGRESO">Egreso</option>
          </select>
          {isGerente && (
            <select
              value={form.sucursalId}
              onChange={(e) => setForm({ ...form, sucursalId: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Seleccionar sucursal</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm"
          >
            Crear Cuenta
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3 font-medium text-slate-600">Código</th>
              <th className="text-left p-3 font-medium text-slate-600">Descripción</th>
              <th className="text-left p-3 font-medium text-slate-600">Tipo</th>
              <th className="text-left p-3 font-medium text-slate-600">Acción</th>
            </tr>
          </thead>
          <tbody>
            {cuentas.map((c) => (
              <tr key={c.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-mono text-xs">{c.codigo}</td>
                <td className="p-3">{c.descripcion}</td>
                <td className="p-3">
                  {c.tipo && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs">
                      {c.tipo}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cuentas.length === 0 && (
          <p className="text-center text-slate-400 py-8">
            No hay cuentas registradas. Creá la primera.
          </p>
        )}
      </div>
    </div>
  );
}
