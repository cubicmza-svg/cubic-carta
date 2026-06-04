'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import ImageUpload from './ImageUpload';
import ToggleSwitch from './ToggleSwitch';
import type { MenuItem } from '@/lib/types';

const schema = z.object({
  categoria: z.string().min(1, 'La categoría es requerida'),
  categoria_nueva: z.string().optional(),
  subcategoria: z.string().optional().default(''),
  subcategoria_nueva: z.string().optional(),
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().optional().default(''),
  precio: z.number().min(0, 'El precio debe ser >= 0').default(0),
  precio_alternativo: z.string().optional().default(''),
  imagen_url: z.string().optional().default(''),
  activo: z.boolean().default(true),
  orden: z.number().int().min(0).default(0),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  item?: MenuItem;
  categorias: string[];
  subcategoriasMap: Record<string, string[]>;
}

const inputClass =
  'w-full px-3 py-2.5 rounded-lg bg-[#211D2A] border border-[#2D2840] text-white font-dm text-sm placeholder-[#9B97A8] focus:outline-none focus:border-[#4ADE80] transition-colors';
const labelClass = 'block font-dm text-sm text-[#9B97A8] mb-1.5';
const errorClass = 'mt-1 font-dm text-xs text-red-400';

export default function ItemForm({ item, categorias, subcategoriasMap }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const isEdit = Boolean(item);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      categoria: item?.categoria ?? '',
      subcategoria: item?.subcategoria ?? '',
      nombre: item?.nombre ?? '',
      descripcion: item?.descripcion ?? '',
      precio: item?.precio ?? 0,
      precio_alternativo: item?.precio_alternativo ?? '',
      imagen_url: item?.imagen_url ?? '',
      activo: item?.activo ?? true,
      orden: item?.orden ?? 0,
    },
  });

  const selectedCat = watch('categoria');
  const selectedSub = watch('subcategoria');

  const subsForCat = subcategoriasMap[selectedCat] ?? [];

  // When category changes, reset subcategory if it doesn't belong
  useEffect(() => {
    if (!subsForCat.includes(selectedSub ?? '')) setValue('subcategoria', '');
  }, [selectedCat]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setServerError('');

    const categoria = values.categoria === '__nueva__' ? (values.categoria_nueva ?? '') : values.categoria;
    const subcategoria = values.subcategoria === '__nueva__' ? (values.subcategoria_nueva ?? '') : (values.subcategoria ?? '');

    const payload: Omit<MenuItem, 'id'> = {
      categoria,
      subcategoria,
      nombre: values.nombre,
      descripcion: values.descripcion ?? '',
      precio: values.precio,
      precio_alternativo: values.precio_alternativo ?? '',
      imagen_url: values.imagen_url ?? '',
      activo: values.activo,
      orden: values.orden,
    };

    try {
      const url = isEdit ? `/api/admin/items/${item!.id}` : '/api/admin/items';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      router.push('/admin/menu');
      router.refresh();
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Categoría */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Categoría *</label>
          <select {...register('categoria')} className={inputClass}>
            <option value="">Seleccioná una categoría</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            <option value="__nueva__">+ Nueva categoría</option>
          </select>
          {errors.categoria && <p className={errorClass}>{errors.categoria.message}</p>}
        </div>

        {selectedCat === '__nueva__' && (
          <div>
            <label className={labelClass}>Nombre de la nueva categoría *</label>
            <input {...register('categoria_nueva')} placeholder="Ej: POSTRES" className={inputClass} />
          </div>
        )}
      </div>

      {/* Subcategoría */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Subcategoría</label>
          <select {...register('subcategoria')} className={inputClass}>
            <option value="">Sin subcategoría</option>
            {subsForCat.map((s) => <option key={s} value={s}>{s}</option>)}
            <option value="__nueva__">+ Nueva subcategoría</option>
          </select>
        </div>
        {selectedSub === '__nueva__' && (
          <div>
            <label className={labelClass}>Nombre de la nueva subcategoría</label>
            <input {...register('subcategoria_nueva')} placeholder="Ej: ESPECIALES" className={inputClass} />
          </div>
        )}
      </div>

      {/* Nombre y descripción */}
      <div>
        <label className={labelClass}>Nombre *</label>
        <input {...register('nombre')} placeholder="Ej: Tostón de Campo" className={inputClass} />
        {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Descripción</label>
        <textarea {...register('descripcion')} rows={2} placeholder="Ingredientes, variantes..." className={`${inputClass} resize-none`} />
      </div>

      {/* Precios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Precio (ARS)</label>
          <input type="number" {...register('precio', { valueAsNumber: true })} min={0} step={100} className={inputClass} />
          {errors.precio && <p className={errorClass}>{errors.precio.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Precio alternativo</label>
          <input {...register('precio_alternativo')} placeholder='Ej: Para compartir: $20.000' className={inputClass} />
        </div>
      </div>

      {/* Imagen */}
      <div>
        <label className={labelClass}>Imagen</label>
        <Controller
          control={control}
          name="imagen_url"
          render={({ field }) => (
            <ImageUpload value={field.value ?? ''} onChange={field.onChange} />
          )}
        />
      </div>

      {/* Orden y estado */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="w-28">
          <label className={labelClass}>Orden</label>
          <input type="number" {...register('orden', { valueAsNumber: true })} min={0} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Activo</label>
          <Controller
            control={control}
            name="activo"
            render={({ field }) => (
              <ToggleSwitch checked={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      {serverError && (
        <p className="font-dm text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {serverError}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-cubic-accent text-black font-dm font-semibold text-sm hover:bg-green-400 transition-colors disabled:opacity-50"
        >
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Agregar ítem'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg border border-cubic-border text-cubic-muted font-dm text-sm hover:text-white hover:border-white transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
