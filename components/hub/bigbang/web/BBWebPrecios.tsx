'use client';
import { useState, useEffect } from 'react';

type Precios = Record<string, string>;

const fmt = (v: string) => {
  const n = parseInt(v.replace(/\D/g, ''), 10);
  return isNaN(n) ? v : n.toLocaleString('es-AR');
};

const SECCIONES = [
  {
    titulo: 'SUPER PROMO',
    color: '#f59e0b',
    campos: [
      { key: 'promo_super_lv', label: 'Precio Lun–Vie' },
    ],
  },
  {
    titulo: 'PROMO CLASIC',
    color: '#ef4444',
    campos: [
      { key: 'promo_clasic_lj',    label: 'Precio Lun–Jue' },
      { key: 'promo_clasic_finde', label: 'Precio Vie–Dom y feriados' },
      { key: 'promo_clasic_sena',  label: 'Monto de seña' },
    ],
  },
  {
    titulo: 'PROMO FULL',
    color: '#06b6d4',
    campos: [
      { key: 'promo_full_lj',    label: 'Precio Lun–Jue' },
      { key: 'promo_full_finde', label: 'Precio Vie–Dom y feriados' },
    ],
  },
  {
    titulo: 'ADICIONALES',
    color: '#8b5cf6',
    campos: [
      { key: 'adic_hora_extra',     label: 'Hora extra' },
      { key: 'adic_invitado_extra', label: 'Invitado extra (c/u)' },
      { key: 'adic_moza',           label: 'Moza' },
      { key: 'adic_parrillero',     label: 'Parrillero + leña' },
      { key: 'adic_dispenser',      label: 'Dispenser de jugo/café' },
    ],
  },
  {
    titulo: 'MENÚ SALADO',
    color: '#f97316',
    campos: [
      { key: 'menu_pizza_muzza',     label: 'Pizza muzzarella 12 porciones' },
      { key: 'menu_pizza_napo',      label: 'Pizza napolitana/especial 12 porciones' },
      { key: 'menu_panchos_24',      label: 'Combo 24 panchos con aderezos' },
      { key: 'menu_hamburguesas_12', label: 'Combo 12 hamburguesas a la parrilla' },
      { key: 'menu_snack',           label: 'Combo snack (papas, chizitos, palitos)' },
      { key: 'menu_empanadas',       label: 'Docena de empanadas' },
      { key: 'menu_sandwiches',      label: 'Sandwich de miga triples x100' },
    ],
  },
  {
    titulo: 'BEBIDAS',
    color: '#06b6d4',
    campos: [
      { key: 'beb_gaseosa',   label: 'Gaseosa Pepsi 1,5 lts' },
      { key: 'beb_agua_sab',  label: 'Agua saborizada H2O 1,5 lts' },
      { key: 'beb_agua_min',  label: 'Agua mineral Eco de los Andes 1,5 lts' },
      { key: 'beb_cerveza',   label: 'Cerveza Quilmes 1 lt' },
      { key: 'beb_hielo',     label: 'Bolsa de hielo 3,5 kg' },
    ],
  },
];

function PriceInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', gap: 16 }}>
      <label style={{ fontSize: 13, color: '#374151', flex: 1 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f9fafb', borderRadius: 10, border: '1.5px solid #e5e7eb', padding: '6px 12px' }}>
        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>$</span>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: 110, border: 'none', background: 'transparent', fontSize: 14, fontWeight: 700, color: '#111827', outline: 'none', textAlign: 'right' }}
        />
      </div>
    </div>
  );
}

export default function BBWebPrecios() {
  const [precios, setPrecios] = useState<Precios>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/bigbang/precios-web')
      .then(r => r.json())
      .then(data => { setPrecios(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function setPrice(key: string, val: string) {
    setPrecios(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  }

  async function guardar() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/bigbang/precios-web', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(precios),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
        <div style={{ fontSize: 14, color: '#9ca3af' }}>Cargando precios...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Precios de la web pública</h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Los cambios se reflejan en bigbangpelotero.com de forma inmediata</p>
        </div>
        <button
          onClick={guardar}
          disabled={saving}
          style={{
            background: saved ? '#22c55e' : '#f97316',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 28px',
            fontWeight: 700,
            fontSize: 14,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'all 0.2s',
          }}>
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 10, fontSize: 13, marginBottom: 24 }}>
          {error}
        </div>
      )}

      {/* Secciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {SECCIONES.map(sec => (
          <div key={sec.titulo} style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #f3f4f6', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: sec.color }} />
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: sec.color, textTransform: 'uppercase' }}>
                {sec.titulo}
              </span>
            </div>
            {sec.campos.map(campo => (
              <PriceInput
                key={campo.key}
                label={campo.label}
                value={precios[campo.key] ?? ''}
                onChange={v => setPrice(campo.key, v)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Vista previa de un precio */}
      <div style={{ marginTop: 32, background: '#f9fafb', borderRadius: 16, padding: '20px 24px', border: '1.5px dashed #e5e7eb' }}>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Vista previa — Promos</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'SUPER', sub: 'Lun–Vie', key: 'promo_super_lv', color: '#f59e0b' },
            { label: 'CLASIC', sub: 'Lun–Jue', key: 'promo_clasic_lj', color: '#ef4444' },
            { label: 'CLASIC', sub: 'Finde', key: 'promo_clasic_finde', color: '#ef4444' },
            { label: 'FULL', sub: 'Lun–Jue', key: 'promo_full_lj', color: '#06b6d4' },
            { label: 'FULL', sub: 'Finde', key: 'promo_full_finde', color: '#06b6d4' },
          ].map(p => (
            <div key={p.key} style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', border: `1.5px solid ${p.color}30`, minWidth: 110 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: p.color, letterSpacing: 1 }}>{p.label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{p.sub}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#111827' }}>${fmt(precios[p.key] ?? '0')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón guardar fijo abajo */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
        <button
          onClick={guardar}
          disabled={saving}
          style={{
            background: saved ? '#22c55e' : '#f97316',
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '14px 32px',
            fontWeight: 800,
            fontSize: 15,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
            transition: 'all 0.2s',
          }}>
          {saving ? '...' : saved ? '✓ Guardado' : '💾 Guardar'}
        </button>
      </div>
    </div>
  );
}
