export function formatCurrency(amount: number, currency: "USD" | "BS" = "USD"): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "VES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "long",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat("es-VE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(date));
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
