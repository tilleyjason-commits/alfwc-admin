import { supabase } from './supabase';
import type { AdminProfile } from './types';

const client = supabase as any;

export async function getAdminProfile() {
  return client.from('admin_profiles').select('*').single();
}

export async function listAdminProfiles() {
  return client
    .from('admin_profiles')
    .select('*, auth_users!inner(email)')
    .order('created_at', { ascending: false });
}

export async function updateAdminProfile(id: string, updates: Partial<Pick<AdminProfile, 'role' | 'display_name'>>) {
  return client.from('admin_profiles').update(updates).eq('id', id).select().single();
}
