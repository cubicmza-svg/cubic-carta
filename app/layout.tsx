import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CUBIC Café & Bar — Carta',
  description: 'Carta digital de CUBIC Café & Bar. Brunch, cafetería, pizzas, hamburguesas, bebidas y más.',
  openGraph: {
    title: 'CUBIC Café & Bar',
    description: 'Carta digital actualizada',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-cubic-bg antialiased">{children}</body>
    </html>
  );
}
