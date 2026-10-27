import { redirect } from 'next/navigation';

// La carta de Cubic ahora es cubicmza.netlify.app (cafetería y resto), y se actualiza subiendo el PDF en /admin/carta.
// Los QR viejos que apuntan acá siguen funcionando: llevan a la carta nueva.
export const dynamic = 'force-dynamic';

export default function CartaPage() {
  redirect('https://cubicmza.netlify.app/');
}
