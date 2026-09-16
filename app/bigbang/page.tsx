import type { Metadata } from 'next';
import BigBangWeb from '@/components/web/bigbang/BigBangWeb';

export const metadata: Metadata = {
  title: 'Big Bang Pelotero · Salón de eventos infantiles en Villa Nueva',
  description: 'Salón de fiestas infantiles exclusivo para 60 personas. 3 inflables enormes, arcade, videojuegos, cocina incluida. Villa Nueva, Mendoza.',
  openGraph: {
    title: 'Big Bang Pelotero',
    description: 'El cumpleaños más explosivo de tu hijo/a.',
    url: 'https://bigbangpelotero.com',
  },
};

export default function Page() {
  return <BigBangWeb />;
}
