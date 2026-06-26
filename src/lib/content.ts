import { supabase } from './supabase';
import type { ContentItem, ContentRevision, AuditEvent, ContentSection, ContentStatus, Json } from './types';

const client = supabase;

export type ContentDraft = {
  section: ContentSection;
  slug: string;
  title?: string | null;
  status?: ContentStatus;
  content: Record<string, Json>;
  imagePublicUrl?: string | null;
  imageAlt?: string | null;
  sortOrder?: number;
};

export async function listContent(section: ContentSection) {
  return client
    .from('app_content')
    .select('*')
    .eq('section', section)
    .neq('status', 'archived')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
}

export async function getContent(section: ContentSection, slug: string) {
  return client
    .from('app_content')
    .select('*')
    .eq('section', section)
    .eq('slug', slug)
    .single();
}

export async function getContentById(id: string) {
  return client.from('app_content').select('*').eq('id', id).single();
}

export async function saveContent(payload: ContentDraft, note?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const row = {
    section: payload.section,
    slug: payload.slug,
    title: payload.title ?? null,
    status: payload.status ?? 'draft',
    content: payload.content,
    image_public_url: payload.imagePublicUrl ?? null,
    image_alt: payload.imageAlt ?? null,
    sort_order: payload.sortOrder ?? 0,
    created_by: user?.id,
    updated_by: user?.id,
  };

  const result = await client
    .from('app_content')
    .upsert(row, { onConflict: 'section,slug' })
    .select()
    .single();

  if (!result.error && note) {
    await client.from('content_revisions').insert({
      content_id: result.data.id,
      status: result.data.status,
      content: result.data.content as Record<string, Json>,
      image_public_url: result.data.image_public_url,
      image_alt: result.data.image_alt,
      note,
      created_by: user?.id,
    });
  }

  return result;
}

export async function publishContent(id: string, note = 'Published from ALFWC admin dashboard.') {
  const { data: { user } } = await supabase.auth.getUser();
  const result = await client
    .from('app_content')
    .update({ status: 'published', published_at: new Date().toISOString(), updated_by: user?.id })
    .eq('id', id)
    .select()
    .single();

  if (!result.error) {
    await client.from('content_revisions').insert({
      content_id: id,
      status: 'published',
      content: result.data.content as Record<string, Json>,
      image_public_url: result.data.image_public_url,
      image_alt: result.data.image_alt,
      note,
      created_by: user?.id,
    });
  }

  return result;
}

export async function archiveContent(id: string, note = 'Archived from ALFWC admin dashboard.') {
  const { data: { user } } = await supabase.auth.getUser();
  const result = await client
    .from('app_content')
    .update({ status: 'archived', updated_by: user?.id })
    .eq('id', id)
    .select()
    .single();

  if (!result.error) {
    await client.from('content_revisions').insert({
      content_id: id,
      status: 'archived',
      content: result.data.content as Record<string, Json>,
      image_public_url: result.data.image_public_url,
      image_alt: result.data.image_alt,
      note,
      created_by: user?.id,
    });
  }

  return result;
}

export async function listRevisions(contentId: string) {
  return client
    .from('content_revisions')
    .select('*, admin_profiles(display_name, role)')
    .eq('content_id', contentId)
    .order('created_at', { ascending: false });
}

export async function listAuditEvents(limit = 50) {
  return client
    .from('audit_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
}

export async function listContentItems(limit = 50): Promise<{ data: ContentItem[] | null; error: unknown }> {
  const result = await client
    .from('app_content')
    .select('*')
    .neq('status', 'archived')
    .order('updated_at', { ascending: false })
    .limit(limit);
  return { data: result.data as ContentItem[] | null, error: result.error };
}

export async function listRevisionItems(limit = 50): Promise<{ data: ContentRevision[] | null; error: unknown }> {
  const result = await client
    .from('content_revisions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data: result.data as ContentRevision[] | null, error: result.error };
}

export async function listAuditEventItems(limit = 50): Promise<{ data: AuditEvent[] | null; error: unknown }> {
  const result = await client.from('audit_events').select('*').order('created_at', { ascending: false }).limit(limit);
  return { data: result.data as AuditEvent[] | null, error: result.error };
}

export function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function parseJson(value: string): Record<string, Json> {
  return JSON.parse(value) as Record<string, Json>;
}

export function stringifyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}
