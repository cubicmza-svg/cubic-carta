'use client';
import { useState, useEffect } from 'react';

type Imagenes = Record<string, string>;

const DRIVE_PREVIEW = (id: string) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w300`;

function extractDriveId(input: string): string {
  const m1 = input.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (m1) return m1[1];
  const m2 = input.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (m2) return m2[1];
  return input.trim();
}

const FEATURED_META = [
  { key: 'featured_1', label: 'Foto destacada 1' },
  { key: 'featured_2', label: 'Foto destacada 2' },
  { key: 'featured_3', label: 'Foto destacada 3' },
  { key: 'featured_4', label: 'Foto destacada 4' },
];

const GALERIA_META = Array.from({ length: 12 }, (_, i) => ({
  key: `galeria_${i + 1}`,
  label: `Foto galería ${i + 1}`,
}));

function ImageInput({
  label, driveId, onChange,
}: {
  label: string;
  driveId: string;
  onChange: (id: string) => void;
}) {
  const [input, setInput] = useState(driveId);

  useEffect(() => { setInput(driveId); }, [driveId]);

  function handleBlur() {
    const extracted = extractDriveId(input);
    setInput(extracted);
    onChange(extracted);
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      {/* Preview */}
      <div style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', border: '1.5px solid #e2e8f0' }}>
        {driveId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={DRIVE_PREVIEW(driveId)} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#cbd5e1' }}>🖼️</div>
        )}
      </div>
      {/* Input */}
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>{label}</label>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onBlur={handleBlur}
          placeholder="Pegá el link de Drive o el ID"
          style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '8px 12px', fontSize: 13, background: '#f9fafb', outline: 'none', color: '#111827' }}
        />
        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
          Pegá un link de Google Drive o solo el ID del archivo
        </p>
      </div>
    </div>
  );
}

export default function BBWebImagenes() {
  const [imagenes, setImagenes] = useState<Imagenes>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/bigbang/imagenes-web')
      .then(r => r.json())
      .then(data => { setImagenes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function setImg(key: string, val: string) {
    setImagenes(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  }

  async function guardar() {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/bigbang/imagenes-web', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imagenes),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(String(e)); }
    finally { setSaving(false); }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
        <span style={{ fontSize: 14, color: '#9ca3af' }}>Cargando imágenes...</span>
      </div>
    );
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #f3f4f6', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: '#6b7280', textTransform: 'uppercase', marginBottom: 16 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Imágenes de la web</h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Pegá links de Google Drive para reemplazar las fotos del sitio</p>
        </div>
        <button onClick={guardar} disabled={saving}
          style={{ background: saved ? '#22c55e' : '#f97316', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s' }}>
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 10, fontSize: 13, marginBottom: 20 }}>{error}</div>
      )}

      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#92400e', marginBottom: 24 }}>
        💡 <strong>Cómo agregar fotos:</strong> Abrí la foto en Google Drive → clic derecho → "Obtener enlace" → copiá el link y pegalo acá.
      </div>

      <Section title="🖼️ Foto principal (hero)">
        <ImageInput label="Foto del salón — aparece a la derecha del título" driveId={imagenes.hero ?? ''} onChange={v => setImg('hero', v)} />
      </Section>

      <Section title="✨ Fotos destacadas — sección Un mundo de diversión">
        {FEATURED_META.map(f => (
          <ImageInput key={f.key} label={f.label} driveId={imagenes[f.key] ?? ''} onChange={v => setImg(f.key, v)} />
        ))}
      </Section>

      <Section title="📸 Galería (12 fotos)">
        {GALERIA_META.map(g => (
          <ImageInput key={g.key} label={g.label} driveId={imagenes[g.key] ?? ''} onChange={v => setImg(g.key, v)} />
        ))}
      </Section>

      {/* Botón fijo */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
        <button onClick={guardar} disabled={saving}
          style={{ background: saved ? '#22c55e' : '#f97316', color: '#fff', border: 'none', borderRadius: 16, padding: '14px 32px', fontWeight: 800, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(249,115,22,0.4)', transition: 'all 0.2s' }}>
          {saving ? '...' : saved ? '✓ Guardado' : '💾 Guardar'}
        </button>
      </div>
    </div>
  );
}
