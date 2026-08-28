import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

/**
 * Supabase Auth فقط ایمیل معتبر (ASCII) قبول می‌کنه، ولی نام کاربری‌های ما
 * ممکنه فارسی/دارای فاصله باشن. برای همین نام کاربری رو به‌صورت قطعی
 * (همیشه یک خروجی ثابت برای یک ورودی) به یک ایمیل معتبر تبدیل می‌کنیم،
 * بدون اینکه چیزی از کاراکترهاش حذف بشه (هیچ دو نام کاربری متفاوتی به یک
 * ایمیل تبدیل نمی‌شن).
 */
const usernameToEmail = (rawUsername: string) => {
  const trimmed = rawUsername.trim();
  if (trimmed.includes('@')) return trimmed; // اگه خودش قبلاً یک ایمیل واقعیه
  const bytes = new TextEncoder().encode(trimmed);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `u${hex}@example.com`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    const email = usernameToEmail(username);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (username: string, password: string, firstName: string, lastName: string) => {
    const trimmedUsername = username.trim();
    const email = usernameToEmail(trimmedUsername);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ user_id: data.user.id, username: trimmedUsername, first_name: firstName, last_name: lastName }]);
      if (profileError) throw profileError;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};