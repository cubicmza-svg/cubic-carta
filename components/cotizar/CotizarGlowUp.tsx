'use client';
import { useState, useEffect } from 'react';

const TAMI_WA = '5492615734018';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio_min: number;
  precio_max: number;
  tiempo: string;
  activo: boolean;
}

const LUGARES = ['Mi casa', 'Salón de fiestas', 'Espacio al aire libre', 'Otro'];
const PERSONAS = ['Hasta 20', '20–50', '50–100', 'Más de 100'];

export default function CotizarGlowUp() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    tematica: '',
    fecha: '',
    lugar: '',
    lugarCustom: '',
    personas: '',
    servicioId: '',
    mensaje: '',
  });
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    fetch('/api/glowup/servicios')
      .then(r => r.ok ? r.json() : [])
      .then((data: Servicio[]) => setServicios(data.filter(s => s.activo)))
      .catch(() => {});
  }, []);

  function set(field: string, val: string) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  function buildMessage() {
    const servicio = servicios.find(s => String(s.id) === form.servicioId);
    const lugar = form.lugar === 'Otro' ? form.lugarCustom : form.lugar;
    const lines = [
      `¡Hola Tami! 🌸 Quiero cotizar un evento con Glow Up`,
      ``,
      `*Nombre:* ${form.nombre}`,
      form.telefono ? `*Teléfono:* ${form.telefono}` : '',
      `*Servicio:* ${servicio ? servicio.nombre : '—'}`,
      `*Temática / Idea:* ${form.tematica}`,
      `*Fecha del evento:* ${form.fecha}`,
      `*Lugar:* ${lugar}`,
      form.personas ? `*Cantidad de personas:* ${form.personas}` : '',
      form.mensaje ? `*Detalles adicionales:* ${form.mensaje}` : '',
    ].filter(Boolean).join('\n');
    return encodeURIComponent(lines);
  }

  function handleEnviar() {
    if (!form.nombre.trim() || !form.servicioId || !form.fecha || !form.tematica.trim()) return;
    const url = `https://wa.me/${TAMI_WA}?text=${buildMessage()}`;
    window.open(url, '_blank');
    setEnviado(true);
  }

  const valid = form.nombre.trim() && form.servicioId && form.fecha && form.tematica.trim();

  if (enviado) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
        style={{ background: 'linear-gradient(135deg,#fdf2f8,#faf5ff,#eff6ff)' }}>
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="font-dm text-2xl font-bold text-gray-800 text-center mb-3">¡Listo! Ya te abrió WhatsApp</h2>
        <p className="font-dm text-gray-500 text-center max-w-xs">
          Enviá el mensaje y Tami te responde a la brevedad 🌸
        </p>
        <button onClick={() => setEnviado(false)}
          className="mt-8 font-dm text-sm text-pink-500 underline underline-offset-2">
          Hacer otra consulta
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#fdf2f8,#faf5ff,#eff6ff)' }}>
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#fbcfe8,#ddd6fe)' }}>
        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="text-5xl mb-4">🌸</div>
          <h1 className="font-bebas text-4xl tracking-widest text-gray-800 mb-2">GLOW UP</h1>
          <p className="font-dm text-gray-600 text-base max-w-sm">
            Contanos tu idea y te armamos un presupuesto personalizado
          </p>
        </div>
        {/* Blobs */}
        <div style={{ position:'absolute',top:'-40px',right:'-40px',width:180,height:180,borderRadius:'50%',background:'#f9a8d4',opacity:0.3,filter:'blur(50px)' }} />
        <div style={{ position:'absolute',bottom:'-30px',left:'-30px',width:140,height:140,borderRadius:'50%',background:'#c4b5fd',opacity:0.3,filter:'blur(40px)' }} />
      </div>

      {/* Form */}
      <div className="max-w-lg mx-auto px-5 py-10 flex flex-col gap-6">

        {/* Nombre */}
        <Field label="Tu nombre *">
          <input value={form.nombre} onChange={e => set('nombre', e.target.value)}
            placeholder="¿Cómo te llamás?"
            className="w-full rounded-xl border px-4 py-3 font-dm text-sm text-gray-800 outline-none focus:border-pink-400"
            style={{ borderColor: '#e9d5ff', background: '#fff' }} />
        </Field>

        {/* Teléfono */}
        <Field label="Tu WhatsApp (opcional)">
          <input value={form.telefono} onChange={e => set('telefono', e.target.value)}
            placeholder="Para que Tami te pueda responder"
            type="tel"
            className="w-full rounded-xl border px-4 py-3 font-dm text-sm text-gray-800 outline-none focus:border-pink-400"
            style={{ borderColor: '#e9d5ff', background: '#fff' }} />
        </Field>

        {/* Servicio */}
        <Field label="¿Qué servicio buscás? *">
          <select value={form.servicioId} onChange={e => set('servicioId', e.target.value)}
            className="w-full rounded-xl border px-4 py-3 font-dm text-sm text-gray-800 outline-none focus:border-pink-400 appearance-none"
            style={{ borderColor: '#e9d5ff', background: '#fff' }}>
            <option value="">Seleccioná un servicio</option>
            {servicios.map(s => (
              <option key={s.id} value={String(s.id)}>
                {s.nombre}{s.precio_min > 0 ? ` · desde $${s.precio_min.toLocaleString('es-AR')}` : ''}
              </option>
            ))}
          </select>
        </Field>

        {/* Temática */}
        <Field label="¿Cuál es tu temática o idea? *">
          <textarea value={form.tematica} onChange={e => set('tematica', e.target.value)}
            placeholder="Ej: Cumple de 15 estilo París, Baby shower celeste, etc."
            rows={3}
            className="w-full rounded-xl border px-4 py-3 font-dm text-sm text-gray-800 outline-none focus:border-pink-400 resize-none"
            style={{ borderColor: '#e9d5ff', background: '#fff' }} />
        </Field>

        {/* Fecha */}
        <Field label="Fecha del evento *">
          <input value={form.fecha} onChange={e => set('fecha', e.target.value)}
            type="date"
            className="w-full rounded-xl border px-4 py-3 font-dm text-sm text-gray-800 outline-none focus:border-pink-400"
            style={{ borderColor: '#e9d5ff', background: '#fff' }} />
        </Field>

        {/* Lugar */}
        <Field label="¿Dónde es el evento?">
          <div className="flex flex-wrap gap-2">
            {LUGARES.map(l => (
              <button key={l} type="button" onClick={() => set('lugar', l)}
                className="font-dm text-sm px-4 py-2 rounded-full border transition-all"
                style={{
                  borderColor: form.lugar === l ? '#db2777' : '#e9d5ff',
                  background: form.lugar === l ? '#db2777' : '#fff',
                  color: form.lugar === l ? '#fff' : '#6b7280',
                }}>
                {l}
              </button>
            ))}
          </div>
          {form.lugar === 'Otro' && (
            <input value={form.lugarCustom} onChange={e => set('lugarCustom', e.target.value)}
              placeholder="¿Dónde exactamente?"
              className="mt-3 w-full rounded-xl border px-4 py-3 font-dm text-sm text-gray-800 outline-none focus:border-pink-400"
              style={{ borderColor: '#e9d5ff', background: '#fff' }} />
          )}
        </Field>

        {/* Personas */}
        <Field label="Cantidad de personas">
          <div className="flex flex-wrap gap-2">
            {PERSONAS.map(p => (
              <button key={p} type="button" onClick={() => set('personas', p)}
                className="font-dm text-sm px-4 py-2 rounded-full border transition-all"
                style={{
                  borderColor: form.personas === p ? '#db2777' : '#e9d5ff',
                  background: form.personas === p ? '#db2777' : '#fff',
                  color: form.personas === p ? '#fff' : '#6b7280',
                }}>
                {p}
              </button>
            ))}
          </div>
        </Field>

        {/* Mensaje adicional */}
        <Field label="¿Algo más que quieras contar?">
          <textarea value={form.mensaje} onChange={e => set('mensaje', e.target.value)}
            placeholder="Colores que te gustan, referencias, dudas..."
            rows={3}
            className="w-full rounded-xl border px-4 py-3 font-dm text-sm text-gray-800 outline-none focus:border-pink-400 resize-none"
            style={{ borderColor: '#e9d5ff', background: '#fff' }} />
        </Field>

        {/* Botón */}
        <button onClick={handleEnviar} disabled={!valid}
          className="w-full py-4 rounded-2xl font-dm font-bold text-base text-white transition-all flex items-center justify-center gap-3"
          style={{
            background: valid ? 'linear-gradient(135deg,#db2777,#9333ea)' : '#d1d5db',
            cursor: valid ? 'pointer' : 'not-allowed',
            boxShadow: valid ? '0 8px 25px rgba(219,39,119,0.35)' : 'none',
          }}>
          <span>💬</span>
          Solicitar información por WhatsApp
        </button>

        <p className="font-dm text-xs text-gray-400 text-center">
          Al tocar el botón se va a abrir WhatsApp con tu consulta lista para enviar
        </p>
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <p className="font-dm text-xs text-gray-400">✨ Glow Up · Decoración de eventos</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-dm text-sm font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  );
}
