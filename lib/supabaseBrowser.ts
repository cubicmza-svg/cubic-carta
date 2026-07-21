import { createClient } from '@supabase/supabase-js';

export const BUCKET = 'cubic diseno';

const supabase = createClient(
  'https://xjkzilnnagwgeejlnnto.supabase.co',
  'sb_publishable_Hx2WbXYa9RPU71rIlCgzTA_Dc7paVfU'
);

export async function uploadDiseno(file: File): Promise<string> {
  const ext  = file.name.split('.').pop() ?? 'bin';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
