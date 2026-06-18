"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  sucursal: { nombre: string } | null;
};

type Sucursal = {
  id: string;
  nombre: string;
};

export default function UsuariosClient({
  usuarios: initial,
  sucursales,
}: {
  usuarios: Usuario[];
  sucursales: Sucursal[];
}) {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "ENCARGADO",
    sucursalId: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ nombre: "", email: "", password: "", rol: "ENCARGADO", sucursalId: "" });
      router.refresh();
      const updated = await fetch("/api/usuarios").then((r) => r.json());
      setUsuarios(updated);
    }
  }

  async function toggleActivo(userId: string, activo: boolean) {
    await fetch("/api/usuarios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, activo: !activo }),
    });
    router.refresh();
    setUsuarios(
      usuarios.map((u) => (u.id === userId ? { ...u, activo: !activo } : u))
    );
  }

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
      >
        {showForm ? "Cancelar" : "Nuevo Usuario"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-xl border space-y-3 max-w-md">
          <input
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            placeholder="Contraseña"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <select
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="ENCARGADO">Encargado</option>
            <option value="GERENTE">Gerente</option>
          </select>
          {form.rol === "ENCARGADO" && (
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
            Crear Usuario
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3 font-medium text-slate-600">Nombre</th>
              <th className="text-left p-3 font-medium text-slate-600">Email</th>
              <th className="text-left p-3 font-medium text-slate-600">Rol</th>
              <th className="text-left p-3 font-medium text-slate-600">Sucursal</th>
              <th className="text-left p-3 font-medium text-slate-600">Estado</th>
              <th className="text-left p-3 font-medium text-slate-600">Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{u.nombre}</td>
                <td className="p-3 text-slate-600">{u.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    u.rol === "GERENTE" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {u.rol === "GERENTE" ? "Gerente" : "Encargado"}
                  </span>
                </td>
                <td className="p-3 text-slate-600">{u.sucursal?.nombre || "-"}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    u.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleActivo(u.id, u.activo)}
                    className={`text-xs hover:underline ${
                      u.activo ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {u.activo ? "Desactivar" : "Activar"}
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
