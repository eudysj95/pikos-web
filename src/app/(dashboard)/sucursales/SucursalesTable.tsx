"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Sucursal = {
  id: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  activa: boolean;
  _count: { usuarios: number };
};

export default function SucursalesTable({
  sucursales: initial,
}: {
  sucursales: Sucursal[];
}) {
  const router = useRouter();
  const [sucursales, setSucursales] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Sucursal | null>(null);
  const [form, setForm] = useState({ nombre: "", direccion: "", telefono: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const method = editing ? "PUT" : "POST";
    const body = editing
      ? { id: editing.id, ...form, activa: editing.activa }
      : form;

    const res = await fetch("/api/sucursales", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowForm(false);
      setEditing(null);
      setForm({ nombre: "", direccion: "", telefono: "" });
      router.refresh();
      const updated = await fetch("/api/sucursales").then((r) => r.json());
      setSucursales(updated);
    }
    setLoading(false);
  }

  function startEdit(s: Sucursal) {
    setEditing(s);
    setForm({
      nombre: s.nombre,
      direccion: s.direccion ?? "",
      telefono: s.telefono ?? "",
    });
    setShowForm(true);
  }

  return (
    <div>
      <button
        onClick={() => {
          setEditing(null);
          setForm({ nombre: "", direccion: "", telefono: "" });
          setShowForm(!showForm);
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
      >
        {showForm ? "Cancelar" : "Nueva Sucursal"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 bg-white rounded-xl border space-y-3"
        >
          <input
            placeholder="Nombre de la sucursal"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            placeholder="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            placeholder="Teléfono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm disabled:opacity-50"
          >
            {loading ? "Guardando..." : editing ? "Actualizar" : "Crear"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3 font-medium text-slate-600">Nombre</th>
              <th className="text-left p-3 font-medium text-slate-600">Dirección</th>
              <th className="text-left p-3 font-medium text-slate-600">Usuarios</th>
              <th className="text-left p-3 font-medium text-slate-600">Estado</th>
              <th className="text-left p-3 font-medium text-slate-600">Acción</th>
            </tr>
          </thead>
          <tbody>
            {sucursales.map((s) => (
              <tr key={s.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{s.nombre}</td>
                <td className="p-3 text-slate-600">{s.direccion || "-"}</td>
                <td className="p-3">{s._count.usuarios}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      s.activa
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {s.activa ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => startEdit(s)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
