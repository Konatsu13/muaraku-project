"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export interface UserProfile {
  user_id: string;
  username: string | null;
  display_name: string;
  avatar_path: string | null;
  bio: string;
  preferred_language: "id" | "en";
  theme: "light" | "dark" | "system";
  gender?: "male" | "female" | "unspecified" | null;
}

export type AuthModalView = "login" | "register" | "otp" | "forgot" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  roles: string[];
  isAdmin: boolean;
  isModerator: boolean;
  isVerifiedStaff: boolean;
  isLoading: boolean;
  authModalView: AuthModalView;
  pendingEmail: string;
  openAuthModal: (view?: AuthModalView, email?: string) => void;
  closeAuthModal: () => void;
  setPendingEmail: (email: string) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  roles: [],
  isAdmin: false,
  isModerator: false,
  isVerifiedStaff: false,
  isLoading: true,
  authModalView: null,
  pendingEmail: "",
  openAuthModal: () => {},
  closeAuthModal: () => {},
  setPendingEmail: () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalView, setAuthModalView] = useState<AuthModalView>(null);
  const [pendingEmail, setPendingEmail] = useState("");

  const supabase = createClient();

  const fetchProfileAndRoles = React.useCallback(async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as UserProfile);
      } else {
        // Fallback profile if row is not yet created
        setProfile({
          user_id: userId,
          username: null,
          display_name: "Pengguna MuaraKu",
          avatar_path: null,
          bio: "",
          preferred_language: "id",
          theme: "system",
        });
      }

      const { data: rolesData } = await supabase
        .from("staff_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesData) {
        setRoles(rolesData.map((r: { role: string }) => r.role));
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfileAndRoles(s.user.id);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfileAndRoles(s.user.id);
      } else {
        setProfile(null);
        setRoles([]);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfileAndRoles]);

  const openAuthModal = (view: AuthModalView = "login", email = "") => {
    if (email) setPendingEmail(email);
    setAuthModalView(view);
  };

  const closeAuthModal = () => {
    setAuthModalView(null);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndRoles(user.id);
    }
  };

  const isAdmin = roles.includes("admin");
  const isModerator = roles.includes("moderator") || isAdmin;
  const isVerifiedStaff = roles.includes("location_verifier") || roles.includes("staff");

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        isAdmin,
        isModerator,
        isVerifiedStaff,
        isLoading,
        authModalView,
        pendingEmail,
        openAuthModal,
        closeAuthModal,
        setPendingEmail,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
