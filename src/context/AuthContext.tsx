import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  favorites: string[];
  playCount: number;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
  toggleFavorite: (gameId: string) => void;
  recordPlay: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load session
  useEffect(() => {
    const savedSession = localStorage.getItem('maths-revision-session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && typeof parsed === 'object') {
          setUser({
            username: parsed.username || 'Anonymous',
            favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
            playCount: typeof parsed.playCount === 'number' ? parsed.playCount : 0
          });
        }
      } catch (e) {
        localStorage.removeItem('maths-revision-session');
      }
    }
  }, []);

  const login = (username: string, password: string) => {
    try {
      const users = JSON.parse(localStorage.getItem('maths-revision-users') || '[]');
      if (!Array.isArray(users)) return false;
      const foundUser = users.find((u: any) => u.username === username && u.password === password);
      
      if (foundUser) {
        const sessionUser = { 
          username: foundUser.username, 
          favorites: Array.isArray(foundUser.favorites) ? foundUser.favorites : [],
          playCount: typeof foundUser.playCount === 'number' ? foundUser.playCount : 0
        };
        setUser(sessionUser);
        localStorage.setItem('maths-revision-session', JSON.stringify(sessionUser));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const register = (username: string, password: string) => {
    try {
      const users = JSON.parse(localStorage.getItem('maths-revision-users') || '[]');
      if (!Array.isArray(users)) {
        localStorage.setItem('maths-revision-users', '[]');
      }
      if (Array.isArray(users) && users.find((u: any) => u.username === username)) return false;

      const newUser = { username, password, favorites: [], playCount: 0 };
      const updatedUsers = Array.isArray(users) ? [...users, newUser] : [newUser];
      localStorage.setItem('maths-revision-users', JSON.stringify(updatedUsers));
      
      // Auto login
      const sessionUser = { username, favorites: [], playCount: 0 };
      setUser(sessionUser);
      localStorage.setItem('maths-revision-session', JSON.stringify(sessionUser));
      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('maths-revision-session');
  };

  const toggleFavorite = (gameId: string) => {
    if (!user) return;
    
    const newFavs = user.favorites.includes(gameId)
      ? user.favorites.filter(id => id !== gameId)
      : [...user.favorites, gameId];
    
    const newUser = { ...user, favorites: newFavs };
    setUser(newUser);
    localStorage.setItem('maths-revision-session', JSON.stringify(newUser));

    // Update permanent storage
    const users = JSON.parse(localStorage.getItem('maths-revision-users') || '[]');
    const userIdx = users.findIndex((u: any) => u.username === user.username);
    if (userIdx !== -1) {
      users[userIdx].favorites = newFavs;
      localStorage.setItem('maths-revision-users', JSON.stringify(users));
    }
  };

  const recordPlay = () => {
    if (!user) return;
    
    const newCount = user.playCount + 1;
    const newUser = { ...user, playCount: newCount };
    setUser(newUser);
    localStorage.setItem('maths-revision-session', JSON.stringify(newUser));

    // Update permanent storage
    const users = JSON.parse(localStorage.getItem('maths-revision-users') || '[]');
    const userIdx = users.findIndex((u: any) => u.username === user.username);
    if (userIdx !== -1) {
      users[userIdx].playCount = newCount;
      localStorage.setItem('maths-revision-users', JSON.stringify(users));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, toggleFavorite, recordPlay }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
