export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Imagen de fondo: carreras de caballos (Unsplash — Annie Spratt) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1755614562495-5361a9da6bc0?fm=jpg&q=80&w=1920')" }}
      />
      {/* Overlay oscuro para legibilidad del formulario */}
      <div className="absolute inset-0 bg-black/60" />
      {children}
    </div>
  );
}
