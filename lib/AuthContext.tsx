import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface User {
  username: string;
  role: 'student' | 'teacher' | 'admin';
  xp: number;
  level: number;
  streak: number;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password?: string) => Promise<void>;
  register: (username: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  updateXP: (amount: number) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage for persistent login
    const savedUser = localStorage.getItem('ai_study_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Fetch latest from DB
      fetch(`/api/user?username=${parsed.username}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setUser(data.data);
          } else {
            localStorage.removeItem('ai_study_user');
          }
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password?: string) => {
    // Basic mock login that creates user if not exists via POST
    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, role: 'student' })
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.data);
      localStorage.setItem('ai_study_user', JSON.stringify({ username }));
    } else {
      throw new Error(data.error || 'Failed to login');
    }
  };

  const register = async (username: string, password: string, role: string) => {
    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, role: role.toLowerCase() })
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.data);
      localStorage.setItem('ai_study_user', JSON.stringify({ username }));
    } else {
      throw new Error(data.error || 'Failed to register');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ai_study_user');
    router.push('/');
  };

  const updateXP = async (amount: number) => {
    if (!user) return;
    
    // Optimistic update
    const newXp = user.xp + amount;
    const newLevel = Math.floor(newXp / 100) + 1;
    setUser({ ...user, xp: newXp, level: newLevel });
    
    // DB Update
    await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, xpToAdd: amount })
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateXP, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
