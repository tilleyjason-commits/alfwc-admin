import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { AdminProfile } from '../lib/types';

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: AdminProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
