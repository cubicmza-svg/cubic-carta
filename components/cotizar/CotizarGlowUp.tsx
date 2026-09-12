'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const TAMI_WA = '5492615734018';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio_min: number;
  precio_max: number;
  activo: boolean;
}

const LUGARES = ['Mi casa', 'Salón de fiestas', 'Aire libre', 'Otro'];
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
      lugar ? `*Lugar:* ${lugar}` : '',
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

  const valid = !!(form.nombre.trim() && form.servicioId && form.fecha && form.tematica.trim());

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'PCMerchis';
          src: url('/fonts/PCMerchisDEMO-Regular.otf') format('opentype');
          font-weight: 400;
        }
        @font-face {
          font-family: 'PCMerchis';
          src: url('/fonts/PCMerchisDEMO-Expanded.otf') format('opentype');
          font-weight: 700;
        }
        .merchis { font-family: 'PCMerchis', cursive; }
        .cotizar-input {
          width: 100%;
          border-radius: 16px;
          border: 2px solid #f9c6d8;
          padding: 12px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1f2937;
          background: rgba(255,255,255,0.85);
          outline: none;
          transition: border-color 0.2s;
          -webkit-text-fill-color: #1f2937;
        }
        .cotizar-input:focus { border-color: #db2777; }
        .cotizar-input::placeholder { color: #c4b5c0; -webkit-text-fill-color: #c4b5c0; }
        .chip {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          padding: 8px 18px;
          border-radius: 999px;
          border: 2px solid #f9c6d8;
          background: rgba(255,255,255,0.8);
          color: #9b6b7a;
          cursor: pointer;
          transition: all 0.15s;
        }
        .chip.active {
          border-color: #db2777;
          background: #db2777;
          color: #fff;
        }
      `}</style>

      <div style={{ minHeight: '100vh', position: 'relative' }}>

        {/* Fondo cuadros */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <Image src="/glowup-bg.jpg" alt="" fill style={{ objectFit: 'cover', opacity: 0.18 }} priority />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(253,242,248,0.5),rgba(250,245,255,0.5))' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', paddingTop: 48, paddingBottom: 32, paddingLeft: 24, paddingRight: 24 }}>
            <div style={{ display: 'inline-block', marginBottom: 20 }}>
              <Image src="/glowup-logo.png" alt="Glow Up" width={220} height={110} style={{ objectFit: 'contain' }} />
            </div>
            <p className="merchis" style={{ fontSize: 22, color: '#c2436b', letterSpacing: 2, marginBottom: 6 }}>
              COTIZÁ TU EVENTO
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9b6b7a', maxWidth: 300, margin: '0 auto' }}>
              Contanos tu idea y Tami te arma un presupuesto personalizado 🌸
            </p>
          </div>

          {enviado ? (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
              <p className="merchis" style={{ fontSize: 26, color: '#c2436b', marginBottom: 12 }}>¡LISTO!</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#9b6b7a', fontSize: 15, maxWidth: 280, margin: '0 auto 32px' }}>
                Se abrió WhatsApp con tu consulta — ¡enviala y Tami te responde a la brevedad!
              </p>
              <button onClick={() => setEnviado(false)} className="chip">
                Hacer otra consulta
              </button>
            </div>
          ) : (
            <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px 60px' }}>
              <Card>

                <Field label="Tu nombre *">
                  <input className="cotizar-input" value={form.nombre}
                    onChange={e => set('nombre', e.target.value)}
                    placeholder="¿Cómo te llamás?" />
                </Field>

                <Field label="Tu WhatsApp (opcional)">
                  <input className="cotizar-input" value={form.telefono} type="tel"
                    onChange={e => set('telefono', e.target.value)}
                    placeholder="Para que Tami pueda responderte" />
                </Field>

                <Field label="¿Qué servicio buscás? *">
                  <select className="cotizar-input" value={form.servicioId}
                    onChange={e => set('servicioId', e.target.value)}
                    style={{ appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Seleccioná un servicio</option>
                    {servicios.map(s => (
                      <option key={s.id} value={String(s.id)}>
                        {s.nombre}{s.precio_min > 0 ? ` · desde $${s.precio_min.toLocaleString('es-AR')}` : ''}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="¿Cuál es tu temática o idea? *">
                  <textarea className="cotizar-input" value={form.tematica} rows={3}
                    onChange={e => set('tematica', e.target.value)}
                    style={{ resize: 'none' }}
                    placeholder="Ej: Cumple de 15 estilo París, Baby shower celeste..." />
                </Field>

                <Field label="Fecha del evento *">
                  <input className="cotizar-input" value={form.fecha} type="date"
                    onChange={e => set('fecha', e.target.value)} />
                </Field>

                <Field label="¿Dónde es el evento?">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {LUGARES.map(l => (
                      <button key={l} type="button"
                        className={`chip${form.lugar === l ? ' active' : ''}`}
                        onClick={() => set('lugar', l)}>{l}</button>
                    ))}
                  </div>
                  {form.lugar === 'Otro' && (
                    <input className="cotizar-input" style={{ marginTop: 10 }}
                      value={form.lugarCustom}
                      onChange={e => set('lugarCustom', e.target.value)}
                      placeholder="¿Dónde exactamente?" />
                  )}
                </Field>

                <Field label="Cantidad de personas">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {PERSONAS.map(p => (
                      <button key={p} type="button"
                        className={`chip${form.personas === p ? ' active' : ''}`}
                        onClick={() => set('personas', p)}>{p}</button>
                    ))}
                  </div>
                </Field>

                <Field label="¿Algo más que quieras contar?">
                  <textarea className="cotizar-input" value={form.mensaje} rows={3}
                    onChange={e => set('mensaje', e.target.value)}
                    style={{ resize: 'none' }}
                    placeholder="Colores, referencias, dudas..." />
                </Field>

                <button onClick={handleEnviar} disabled={!valid}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: 20,
                    border: 'none',
                    background: valid ? 'linear-gradient(135deg,#db2777,#9333ea)' : '#e5d6db',
                    color: valid ? '#fff' : '#c4b5c0',
                    cursor: valid ? 'pointer' : 'not-allowed',
                    boxShadow: valid ? '0 8px 30px rgba(219,39,119,0.4)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'all 0.2s',
                  }}>
                  <span className="merchis" style={{ fontSize: 18, letterSpacing: 1 }}>
                    💬 SOLICITAR INFORMACIÓN
                  </span>
                </button>

                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#c4b5c0', textAlign: 'center', marginTop: 12 }}>
                  Se abre WhatsApp con tu consulta lista para enviar
                </p>

              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.6)',
      backdropFilter: 'blur(16px)',
      borderRadius: 28,
      border: '1.5px solid rgba(249,198,216,0.5)',
      padding: '28px 24px',
      display: 'flex', flexDirection: 'column', gap: 20,
      boxShadow: '0 8px 40px rgba(219,39,119,0.08)',
    }}>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#9b6b7a' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
