import type { Json } from './types';

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string;
          role: 'admin' | 'publisher' | 'editor';
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: 'admin' | 'publisher' | 'editor';
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'admin' | 'publisher' | 'editor';
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      app_content: {
        Row: {
          id: string;
          section: 'home' | 'sermon' | 'event' | 'quick_action' | 'links' | 'onboarding' | 'image_asset';
          slug: string;
          title: string | null;
          status: 'draft' | 'published' | 'archived';
          content: Record<string, Json>;
          image_public_url: string | null;
          image_alt: string | null;
          sort_order: number;
          published_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section: 'home' | 'sermon' | 'event' | 'quick_action' | 'links' | 'onboarding' | 'image_asset';
          slug: string;
          title?: string | null;
          status?: 'draft' | 'published' | 'archived';
          content?: Record<string, Json>;
          image_public_url?: string | null;
          image_alt?: string | null;
          sort_order?: number;
          published_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section?: 'home' | 'sermon' | 'event' | 'quick_action' | 'links' | 'onboarding' | 'image_asset';
          slug?: string;
          title?: string | null;
          status?: 'draft' | 'published' | 'archived';
          content?: Record<string, Json>;
          image_public_url?: string | null;
          image_alt?: string | null;
          sort_order?: number;
          published_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_revisions: {
        Row: {
          id: string;
          content_id: string;
          status: 'draft' | 'published' | 'archived';
          content: Record<string, Json>;
          image_public_url: string | null;
          image_alt: string | null;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content_id: string;
          status: 'draft' | 'published' | 'archived';
          content: Record<string, Json>;
          image_public_url?: string | null;
          image_alt?: string | null;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content_id?: string;
          status?: 'draft' | 'published' | 'archived';
          content?: Record<string, Json>;
          image_public_url?: string | null;
          image_alt?: string | null;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_events: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_email: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Record<string, Json>;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Record<string, Json>;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Record<string, Json>;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
