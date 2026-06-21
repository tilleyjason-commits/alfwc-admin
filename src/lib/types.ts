export type AppRole = 'admin' | 'publisher' | 'editor';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type ContentSection = 'home' | 'sermon' | 'event' | 'quick_action' | 'links' | 'onboarding' | 'image_asset';

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type AdminProfile = {
  id: string;
  role: AppRole;
  display_name?: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentItem = {
  id: string;
  section: ContentSection;
  slug: string;
  title?: string | null;
  status: ContentStatus;
  content: Record<string, Json>;
  image_public_url?: string | null;
  image_alt?: string | null;
  sort_order: number;
  published_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentRevision = {
  id: string;
  content_id: string;
  status: ContentStatus;
  content: Record<string, Json>;
  image_public_url?: string | null;
  image_alt?: string | null;
  note?: string | null;
  created_by?: string | null;
  created_at: string;
};

export type AuditEvent = {
  id: string;
  actor_id?: string | null;
  actor_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata: Record<string, Json>;
  created_at: string;
};

export type StorageAsset = {
  name: string;
  publicUrl?: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: Record<string, Json>;
};
