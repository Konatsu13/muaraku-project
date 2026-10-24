"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  switchAccount: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
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
  switchAccount: async () => {},
  updateProfile: async () => ({ error: null }),
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

  const supabase = useMemo(() => createClient(), []);
  const userRef = useRef<User | null>(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const hasProvisionedAdminRef = useRef(false);

  const fetchProfileAndRoles = useCallback(
    async (userId: string, currentUser?: User | null) => {
      try {
        // 1. Fetch profile: try canonical user_profiles, fallback to profiles
        let foundProfile: UserProfile | null = null;

        const { data: userProfileData } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (userProfileData) {
          foundProfile = userProfileData as UserProfile;
        } else {
          const { data: legacyProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

          if (legacyProfile) {
            foundProfile = {
              user_id: legacyProfile.id,
              username: legacyProfile.username,
              display_name: legacyProfile.display_name || "Pengguna MuaraKu",
              avatar_path: legacyProfile.avatar_path,
              bio: "",
              preferred_language: (legacyProfile.language as "id" | "en") || "id",
              theme: (legacyProfile.theme as "light" | "dark" | "system") || "system",
            };
          }
        }

        if (foundProfile) {
          setProfile(foundProfile);
        } else {
          // Fallback default
          const activeUser = currentUser || userRef.current;
          const displayName =
            activeUser?.user_metadata?.display_name ||
            activeUser?.user_metadata?.full_name ||
            activeUser?.email?.split("@")[0] ||
            "Pengguna MuaraKu";

          setProfile({
            user_id: userId,
            username: null,
            display_name: displayName,
            avatar_path: null,
            bio: "",
            preferred_language: "id",
            theme: "system",
          });
        }

        // 2. Fetch roles: try staff_roles first, then user_roles
        let userRoles: string[] = [];

        const { data: staffData } = await supabase
          .from("staff_roles")
          .select("role")
          .eq("user_id", userId);

        if (staffData && staffData.length > 0) {
          userRoles = staffData.map((r: { role: string }) => r.role);
        } else {
          const { data: legacyRoles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId);

          if (legacyRoles && legacyRoles.length > 0) {
            userRoles = legacyRoles.map((r: { role: string }) => r.role);
          }
        }

        // 3. Admin auto-check for fathan.pageraji@gmail.com
        const activeUser = currentUser || userRef.current;
        const email = activeUser?.email?.toLowerCase().trim();
        if (email === "fathan.pageraji@gmail.com") {
          if (!userRoles.includes("admin")) {
            userRoles.push("admin");
          }
          // Attempt server-side sync to database once
          if (!hasProvisionedAdminRef.current) {
            hasProvisionedAdminRef.current = true;
            fetch("/api/auth/provision-admin", { method: "POST" }).catch(() => {});
          }
        }

        setRoles(userRoles);
      } catch (err) {
        console.error("Error fetching user profile & roles:", err);
      }
    },
    [supabase]
  );

  const fetchProfileAndRolesRef = useRef(fetchProfileAndRoles);
  useEffect(() => {
    fetchProfileAndRolesRef.current = fetchProfileAndRoles;
  }, [fetchProfileAndRoles]);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      if (!isMounted) return;
      const s = data.session;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfileAndRolesRef.current(s.user.id, s.user);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: unknown, s: Session | null) => {
      if (!isMounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfileAndRolesRef.current(s.user.id, s.user);
      } else {
        setProfile(null);
        setRoles([]);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

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
    hasProvisionedAdminRef.current = false;
  };

  // Safe switch account implementation: sign out first, then immediately open login modal
  const switchAccount = async () => {
    await signOut();
    openAuthModal("login");
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: Error | null }> => {
    const activeUser = userRef.current;
    if (!activeUser) return { error: new Error("Pengguna belum login") };

    try {
      // Try updating canonical user_profiles
      const { error: upError } = await supabase
        .from("user_profiles")
        .update({
          display_name: updates.display_name,
          username: updates.username,
          avatar_path: updates.avatar_path,
          bio: updates.bio,
          preferred_language: updates.preferred_language,
          theme: updates.theme,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", activeUser.id);

      // Fallback for legacy profiles table if present
      if (upError) {
        await supabase
          .from("profiles")
          .update({
            display_name: updates.display_name,
            username: updates.username,
            avatar_path: updates.avatar_path,
            language: updates.preferred_language,
            theme: updates.theme,
            updated_at: new Date().toISOString(),
          })
          .eq("id", activeUser.id);
      }

      await fetchProfileAndRoles(activeUser.id, activeUser);
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error("Gagal memperbarui profil") };
    }
  };

  const refreshProfile = async () => {
    const activeUser = userRef.current;
    if (activeUser) {
      await fetchProfileAndRoles(activeUser.id, activeUser);
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
        switchAccount,
        updateProfile,
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
