'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  async function uploadFile(file: File) {
    setError('');
    setUploading(true);
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir');
      onChange(data.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al subir imagen');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Solo imágenes'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Máximo 5 MB'); return; }
    uploadFile(file);
  }

  const displayImage = preview || value;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 p-6
          ${dragging ? 'border-cubic-accent bg-cubic-accent/10' : 'border-cubic-border bg-cubic-bg-input hover:border-cubic-accent/50'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {displayImage ? (
          <div className="relative w-32 h-32">
            <Image src={displayImage} alt="Preview" fill className="object-cover rounded-lg" unoptimized />
          </div>
        ) : (
          <>
            <span className="text-3xl text-cubic-muted">📷</span>
            <p className="font-dm text-sm text-cubic-muted text-center">
              Arrastrá una imagen o <span className="text-cubic-accent">hacé click</span>
            </p>
            <p className="font-dm text-xs text-cubic-muted">JPG, PNG, WebP · máx 5 MB</p>
          </>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
            <span className="font-dm text-sm text-cubic-accent animate-pulse">Subiendo...</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      {/* URL manual */}
      <div className="flex gap-2 items-center">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="O pegá una URL de imagen..."
          className="flex-1 px-3 py-2 rounded-lg bg-[#211D2A] border border-cubic-border text-white text-sm font-dm placeholder-cubic-muted focus:outline-none focus:border-cubic-accent transition-colors"
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(''); setPreview(null); }}
            className="text-cubic-muted hover:text-red-400 text-sm transition-colors px-2"
          >
            ✕
          </button>
        )}
      </div>

      {error && <p className="font-dm text-red-400 text-xs">{error}</p>}
    </div>
  );
}
