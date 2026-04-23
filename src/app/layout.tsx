import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rayo Express ⚡ Cotizador Solar Instantáneo',
  description: 'Obtené tu presupuesto de energía solar en 60 segundos. Subí tu factura de luz y recibí una cotización personalizada al instante.',
  keywords: 'energía solar, paneles solares, cotizador solar, Edenor, Edesur, Buenos Aires, GBA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-rayo-gris-claro min-h-screen">
        {children}
      </body>
    </html>
  );
}
