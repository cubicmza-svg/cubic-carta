'use client';
import { useState } from 'react';
import BBWebPrecios from './BBWebPrecios';
import BBWebImagenes from './BBWebImagenes';

const TABS = [
  { key: 'precios', label: '💰 Precios' },
  { key: 'imagenes', label: '🖼️ Imágenes' },
] as const;

type Tab = typeof TABS[number]['key'];

export default function BBWebHub() {
  const [tab, setTab] = useState<Tab>('precios');

  return (
    <div>
      {/* Tab bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f3f4f6', padding: '0 24px', display: 'flex', gap: 4 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: '14px 20px', border: 'none', background: 'transparent',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              color: tab === t.key ? '#f97316' : '#6b7280',
              borderBottom: tab === t.key ? '2px solid #f97316' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'precios' && <BBWebPrecios />}
      {tab === 'imagenes' && <BBWebImagenes />}
    </div>
  );
}
