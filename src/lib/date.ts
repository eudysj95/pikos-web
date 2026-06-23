const TZ = "America/Caracas";

function fmtTZ(d: Date): string {
  const parts = new Intl.DateTimeFormat("es-VE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Retorna la fecha actual en Venezuela como YYYY-MM-DD */
export function hoyLocal(): string {
  return fmtTZ(new Date());
}

/** Retorna la fecha de hace N días en Venezuela como YYYY-MM-DD */
export function haceLocal(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return fmtTZ(d);
}
