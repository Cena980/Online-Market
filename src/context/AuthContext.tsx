import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  user_type: 'customer' | 'business_owner';
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
}

interface AuthContextType {
  state: AuthState;
  signUp: (email: string, password: string, fullName: string, userType: 'customer' | 'business_owner') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null }));
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null }));
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setState(prev => ({ ...prev, profile: null, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setState(prev => ({ ...prev, profile: data, loading: false }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signUp = async (email: string, password: string, fullName: string, userType: 'customer' | 'business_owner') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType,
          },
        },
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (!error) {
        setState(prev => ({
          ...prev,
          profile: prev.profile ? { ...prev.profile, ...updates } : null,
        }));
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ state, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};