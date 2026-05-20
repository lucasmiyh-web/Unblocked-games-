import React, { createContext, useContext, useState, useEffect } from 'react';
import { safeStorage } from '../lib/storage';
import { db, auth } from '../lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface User {
  username: string;
  favorites: string[];
  playCount: number;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleFavorite: (gameId: string) => Promise<void>;
  recordPlay: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session and sync with Firebase Auth
  useEffect(() => {
    let fired = false;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Only run the init logic once
      if (fired) return;
      fired = true;

      try {
        const savedSession = safeStorage.getItem('maths-revision-session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.username) {
            const userRef = doc(db, 'users', parsed.username);
            // Add a timeout to the initial check to prevent infinite loading
            const checkPromise = getDoc(userRef);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 10000)
            );
            
            const userSnap = await Promise.race([checkPromise, timeoutPromise]) as any;
            if (userSnap.exists()) {
              const data = userSnap.data();
              setUser({
                username: data.username,
                favorites: data.favorites || [],
                playCount: data.playCount || 0,
                lastLogin: data.lastLogin
              });
            } else {
              safeStorage.removeItem('maths-revision-session');
              setUser(null);
            }
          }
        }
      } catch (e) {
        console.warn("Auth Init sync failed:", e);
      } finally {
        setLoading(false);
      }
    });

    // Attempt anonymous sign-in in the background
    if (!auth.currentUser) {
      signInAnonymously(auth).catch(e => console.warn("Anon Auth failed:", e));
    }

    return () => unsubscribe();
  }, []);

  const login = async (username: string, password: string) => {
    const path = `users/${username}`;
    try {
      const userRef = doc(db, 'users', username);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.password === password) {
          const lastLogin = new Date().toISOString();
          
          await updateDoc(userRef, { lastLogin });
          console.log(`User logged in via Firestore: ${username}`);
          
          const sessionUser = { 
            username: userData.username, 
            favorites: userData.favorites || [],
            playCount: userData.playCount || 0,
            lastLogin
          };

          setUser(sessionUser);
          safeStorage.setItem('maths-revision-session', JSON.stringify(sessionUser));
          return true;
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
    return false;
  };

  const register = async (username: string, password: string) => {
    const path = `users/${username}`;
    try {
      const userRef = doc(db, 'users', username);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) return false;

      const lastLogin = new Date().toISOString();
      const newUser = { 
        username, 
        password, 
        favorites: [], 
        playCount: 0,
        lastLogin
      };

      await setDoc(userRef, newUser);
      console.log(`User registered in Firestore: ${username}`);
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.warn("Silent sign-in failed during registration", e);
      }

      const sessionUser = { 
        username, 
        favorites: [], 
        playCount: 0,
        lastLogin
      };
      
      setUser(sessionUser);
      safeStorage.setItem('maths-revision-session', JSON.stringify(sessionUser));
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    safeStorage.removeItem('maths-revision-session');
    auth.signOut();
  };

  const toggleFavorite = async (gameId: string) => {
    if (!user) return;
    
    const newFavs = user.favorites.includes(gameId)
      ? user.favorites.filter(id => id !== gameId)
      : [...user.favorites, gameId];
    
    const path = `users/${user.username}`;
    try {
      const userRef = doc(db, 'users', user.username);
      await updateDoc(userRef, { favorites: newFavs });
      
      const newUser = { ...user, favorites: newFavs };
      setUser(newUser);
      safeStorage.setItem('maths-revision-session', JSON.stringify(newUser));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const recordPlay = async () => {
    if (!user) return;
    
    const newCount = user.playCount + 1;
    const path = `users/${user.username}`;
    try {
      const userRef = doc(db, 'users', user.username);
      await updateDoc(userRef, { playCount: newCount });
      
      const newUser = { ...user, playCount: newCount };
      setUser(newUser);
      safeStorage.setItem('maths-revision-session', JSON.stringify(newUser));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, toggleFavorite, recordPlay, loading }}>
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
