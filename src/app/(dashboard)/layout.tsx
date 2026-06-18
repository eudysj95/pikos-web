import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getTasaDelDia } from "@/lib/tasa";
import { CurrencyProvider } from "@/lib/currency-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const sucursalId = session.user.sucursalId;
  const tasa = await getTasaDelDia(sucursalId ?? undefined);

  return (
    <CurrencyProvider tasa={tasa}>
      <div className="flex h-screen">
        <Sidebar
          rol={session.user.rol}
          sucursalNombre={session.user.sucursalNombre}
          userName={session.user.name ?? ""}
        />
        <main className="flex-1 overflow-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </CurrencyProvider>
  );
}
