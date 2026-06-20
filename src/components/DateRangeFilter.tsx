"use client";

import { useRouter } from "next/navigation";

type Props = {
  desde: string;
  hasta: string;
};

export default function DateRangeFilter({ desde, hasta }: Props) {
  const router = useRouter();

  function cambiar(param: string, value: string) {
    const params = new URLSearchParams(window.location.search);
    params.set(param, value);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      <div>
        <label className="block text-xs text-slate-500 mb-0.5">Desde</label>
        <input
          type="date"
          value={desde}
          onChange={(e) => cambiar("desde", e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-0.5">Hasta</label>
        <input
          type="date"
          value={hasta}
          onChange={(e) => cambiar("hasta", e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
    </div>
  );
}
