export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Imagen de fondo: carreras de caballos */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg-login.jpg')" }}
      />
      {/* Overlay oscuro para legibilidad del formulario */}
      <div className="absolute inset-0 bg-black/60" />
      {children}
    </div>
  );
}
