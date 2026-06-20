/** Retorna la fecha local actual como YYYY-MM-DD */
export function hoyLocal(): string {
  const d = new Date();
  return fmtLocal(d);
}

/** Retorna la fecha local de hace N días como YYYY-MM-DD */
export function haceLocal(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return fmtLocal(d);
}

function fmtLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
