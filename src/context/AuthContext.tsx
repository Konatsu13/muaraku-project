'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useToast } from './ToastContext';

interface AuthContextType {
  currentUser: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeAuthModal: 'login' | 'register' | 'forgot-password' | null;
  openAuthModal: (view?: 'login' | 'register' | 'forgot-password') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; emailConfirmation?: boolean }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  targetRedirect: string | null;
  setTargetRedirect: (route: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [targetRedirect, setTargetRedirect] = useState<string | null>(null);
  const [activeAuthModal, setActiveAuthModal] = useState<'login' | 'register' | 'forgot-password' | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('muaraku_theme');
      return (saved as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });

  // Apply theme to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('muaraku_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    showToast(`Tema beralih ke ${theme === 'light' ? 'Dark Mode' : 'Light Mode'}`, 'info');
  };

  // Helper to fetch or initialize user profile from Supabase profiles table
  const syncSupabaseProfile = useCallback(async (sbUser: SupabaseUser): Promise<User> => {
    if (!supabase) throw new Error('Supabase client is not initialized');

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sbUser.id)
        .maybeSingle();

      if (profile && !error) {
        const user: User = {
          id: profile.id,
          name: profile.name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Warga Sekolah',
          email: profile.email || sbUser.email || '',
          phone: profile.phone || '',
          role: profile.role || 'student',
          institution: profile.institution || 'SMA Negeri 1 / Lingkungan Sekolah',
          is_verified_staff: Boolean(profile.is_verified_staff),
          staff_authority_id: profile.staff_authority_id || undefined,
          avatar_url: profile.avatar_url || sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name || sbUser.email || 'User')}`,
          civic_karma: profile.civic_karma ?? 100,
          created_at: profile.created_at || sbUser.created_at || new Date().toISOString(),
        };
        return user;
      }

      // If no profile row yet, insert a new record for this authenticated user
      const defaultName = sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Warga Sekolah';
      const defaultAvatar = sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(defaultName)}`;
      const newProfileData = {
        id: sbUser.id,
        name: defaultName,
        email: sbUser.email || '',
        phone: '',
        role: 'student' as const,
        institution: 'SMA Negeri 1 / Lingkungan Sekolah',
        is_verified_staff: false,
        avatar_url: defaultAvatar,
        civic_karma: 100,
      };

      await supabase.from('profiles').upsert(newProfileData);

      return {
        ...newProfileData,
        created_at: sbUser.created_at || new Date().toISOString(),
      };
    } catch (err) {
      console.error('Error fetching Supabase profile, constructing authenticated fallback:', err);
      const name = sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Warga Sekolah';
      return {
        id: sbUser.id,
        name,
        email: sbUser.email || '',
        role: 'student',
        civic_karma: 100,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        created_at: sbUser.created_at || new Date().toISOString(),
      };
    }
  }, []);

  // Supabase Auth Listener & Session Initialization
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      setIsAuthenticated(false);
      setCurrentUser(null);
      return;
    }

    let isMounted = true;

    // 1. Initial Session Check from Supabase
    supabase.auth.getSession().then(async ({ data: { session: initialSession }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.error('Error fetching Supabase session:', error);
        setIsLoading(false);
        setIsAuthenticated(false);
        setCurrentUser(null);
        return;
      }

      if (initialSession?.user) {
        setSession(initialSession);
        setSupabaseUser(initialSession.user);
        setIsAuthenticated(true);
        const profile = await syncSupabaseProfile(initialSession.user);
        if (isMounted) {
          setCurrentUser(profile);
        }
      } else {
        setSession(null);
        setSupabaseUser(null);
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    // 2. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !currentSession?.user) {
        setSession(null);
        setSupabaseUser(null);
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      setSession(currentSession);
      setSupabaseUser(currentSession.user);
      setIsAuthenticated(true);

      const profile = await syncSupabaseProfile(currentSession.user);
      if (isMounted) {
        setCurrentUser(profile);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncSupabaseProfile]);

  const openAuthModal = (view: 'login' | 'register' | 'forgot-password' = 'login') => {
    setActiveAuthModal(view);
  };

  const closeAuthModal = () => {
    setActiveAuthModal(null);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      const err = 'Koneksi Supabase belum terkonfigurasi. Harap buat file .env dan masukkan VITE_SUPABASE_URL serta VITE_SUPABASE_ANON_KEY.';
      showToast(err, 'error');
      return { success: false, error: err };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let friendlyMsg = error.message;
        if (error.message.includes('Invalid login credentials')) {
          friendlyMsg = 'Email atau kata sandi tidak cocok. Silakan periksa kembali.';
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMsg = 'Alamat email belum diverifikasi. Silakan periksa inbox email Anda untuk aktivasi.';
        }
        showToast(friendlyMsg, 'error');
        return { success: false, error: friendlyMsg };
      }

      if (data.user) {
        const profile = await syncSupabaseProfile(data.user);
        setCurrentUser(profile);
        setIsAuthenticated(true);
        setSupabaseUser(data.user);
        setSession(data.session);
        closeAuthModal();
        showToast(`Selamat datang kembali, ${profile.name}!`, 'success');
        return { success: true };
      }

      return { success: false, error: 'Login gagal. Periksa email & kata sandi Anda.' };
    } catch (err: any) {
      const msg = err?.message || 'Terjadi gangguan koneksi saat masuk.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; emailConfirmation?: boolean }> => {
    if (!isSupabaseConfigured || !supabase) {
      const err = 'Koneksi Supabase belum terkonfigurasi. Harap isi file .env terlebih dahulu.';
      showToast(err, 'error');
      return { success: false, error: err };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        let friendlyMsg = error.message;
        if (error.message.includes('already registered')) {
          friendlyMsg = 'Email ini sudah terdaftar. Silakan masuk menggunakan akun Anda.';
        }
        showToast(friendlyMsg, 'error');
        return { success: false, error: friendlyMsg };
      }

      if (data.user) {
        // Create initial profile record in profiles table
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: name.trim(),
            email: email.trim(),
            role: 'student',
            institution: 'SMA Negeri 1 / Lingkungan Sekolah',
            is_verified_staff: false,
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
            civic_karma: 100,
            created_at: new Date().toISOString()
          });
        } catch (profileErr) {
          console.warn('Profile record note:', profileErr);
        }

        const requiresConfirmation = !data.session;
        if (requiresConfirmation) {
          showToast('Pendaftaran berhasil! Silakan periksa inbox email Anda untuk mengonfirmasi akun.', 'info');
        } else {
          showToast(`Akun warga berhasil dibuat! Selamat datang, ${name}.`, 'success');
          closeAuthModal();
        }

        return {
          success: true,
          emailConfirmation: requiresConfirmation,
        };
      }

      return { success: false, error: 'Pendaftaran tidak dapat diselesaikan oleh Supabase.' };
    } catch (err: any) {
      const msg = err?.message || 'Terjadi kesalahan sistem saat mendaftar.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logout = async (): Promise<void> => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error during Supabase signOut:', err);
      }
    }
    setCurrentUser(null);
    setSupabaseUser(null);
    setSession(null);
    setIsAuthenticated(false);
    showToast('Anda telah keluar dari akun.', 'info');
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      const err = 'Koneksi Supabase belum terkonfigurasi. Harap isi file .env.';
      showToast(err, 'error');
      return { success: false, error: err };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });

      if (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
      }

      showToast('Tautan atur ulang kata sandi telah dikirim ke email Anda.', 'success');
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Gagal mengirim instruksi pemulihan kata sandi.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        supabaseUser,
        session,
        isAuthenticated,
        isLoading,
        isSupabaseConfigured,
        theme,
        toggleTheme,
        activeAuthModal,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        resetPassword,
        targetRedirect,
        setTargetRedirect,
      }}
    >
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
