import { supabase } from './supabase';
import type { StorageAsset } from './types';

export const STORAGE_BUCKET = 'app-assets';

export function publicUrl(path: string) {
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function uploadImage(file: File, prefix: string) {
  const safeName = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '-')}`;
  const path = `images/${prefix}/${safeName}`;
  const result = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/png',
  });

  if (result.error) return result;
  return { ...result, data: { ...result.data, publicUrl: publicUrl(path) } };
}

export async function listImages(prefix?: string) {
  const result = await supabase.storage.from(STORAGE_BUCKET).list(prefix ?? 'images', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  return {
    data: (result.data ?? []).map((item) => ({ ...item, publicUrl: publicUrl(`${prefix ?? 'images'}/${item.name}`) })) as StorageAsset[],
    error: result.error,
  };
}
