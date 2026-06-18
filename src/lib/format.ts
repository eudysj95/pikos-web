export function formatUSD(usd: number, tasa: number | null): string {
  if (tasa === null || tasa === 0) return `$${usd.toFixed(2)}`;
  return `$${usd.toFixed(2)} / Bs. ${(usd * tasa).toFixed(2)}`;
}

export function formatBs(bs: number): string {
  return `Bs. ${bs.toFixed(2)}`;
}
