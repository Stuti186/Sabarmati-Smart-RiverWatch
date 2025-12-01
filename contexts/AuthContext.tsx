/**
 * AuthContext
 * Authentication context with Firebase Auth integration and persistence
 * Includes DEV MODE for development/hackathon testing without Firebase
 */

import { register, resetPassword, signIn, signInWithGoogle } from '@/services/auth';
import { auth } from '@/services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

// DEV MODE: Enable this for development without Firebase
// Set FORCE_DEV_AUTH to true to bypass Firebase authentication during development
const FORCE_DEV_AUTH = true; // <-- SET TO false WHEN YOU HAVE REAL FIREBASE USERS
const DEV_MODE = __DEV__ && (FORCE_DEV_AUTH || !auth);
const DEV_USER = {
  uid: 'dev-user-123',
  email: 'test@example.com',
  displayName: 'Dev User',
  emailVerified: true,
  photoURL: null,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'dev-token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: null,
  providerId: 'password',
} as unknown as User;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isDevMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@smart_river_watch_auth';
const DEV_AUTH_KEY = '@smart_river_watch_dev_auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Initialize auth state listener
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    // DEV MODE: Check for stored dev session
    if (DEV_MODE) {
      console.log('🔧 DEV MODE: Firebase not configured, using development authentication');
      const checkDevAuth = async () => {
        try {
          const devAuth = await AsyncStorage.getItem(DEV_AUTH_KEY);
          if (devAuth) {
            setUser(DEV_USER);
          }
        } catch (error) {
          console.error('Error checking dev auth:', error);
        } finally {
          setLoading(false);
          setInitializing(false);
        }
      };
      checkDevAuth();
      return;
    }
    
    try {
      // Check if auth is available (Firebase might not be initialized)
      if (!auth) {
        console.warn('Firebase auth not available. App will continue without authentication.');
        setLoading(false);
        setInitializing(false);
        return;
      }
      
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // User is signed in
            setUser(firebaseUser);
            // Store auth state in AsyncStorage
            await AsyncStorage.setItem(
              AUTH_STORAGE_KEY,
              JSON.stringify({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
              })
            );
          } else {
            // User is signed out
            setUser(null);
            // Clear auth state from AsyncStorage
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          }
        } catch (error) {
          console.error('Error handling auth state:', error);
        } finally {
          setLoading(false);
          if (initializing) {
            setInitializing(false);
          }
        }
      });
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      // If Firebase fails, set loading to false so app can continue
      setLoading(false);
      setInitializing(false);
    }

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initializing]);

  // Restore auth state from AsyncStorage on mount
  useEffect(() => {
    const restoreAuthState = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          // Auth state will be set by onAuthStateChanged listener
          // This just ensures we have the data available immediately
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
      }
    };

    restoreAuthState();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // DEV MODE: Accept any credentials with valid format
    if (DEV_MODE) {
      console.log('🔧 DEV MODE: Logging in with development credentials');
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // Store dev session
      await AsyncStorage.setItem(DEV_AUTH_KEY, 'true');
      setUser(DEV_USER);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      await signIn(email, password);
      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const registerUser = async (email: string, password: string): Promise<void> => {
    // DEV MODE: Simulate registration
    if (DEV_MODE) {
      console.log('🔧 DEV MODE: Registering with development credentials');
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      await AsyncStorage.setItem(DEV_AUTH_KEY, 'true');
      setUser(DEV_USER);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      await register(email, password);
      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    // DEV MODE: Simulate password reset
    if (DEV_MODE) {
      console.log('🔧 DEV MODE: Password reset email "sent" to', email);
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }
    
    try {
      await resetPassword(email);
    } catch (error: any) {
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    // DEV MODE: Simulate Google login
    if (DEV_MODE) {
      console.log('🔧 DEV MODE: Google login simulated');
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      await AsyncStorage.setItem(DEV_AUTH_KEY, 'true');
      setUser(DEV_USER);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      await signInWithGoogle();
      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // DEV MODE: Clear dev session
      if (DEV_MODE) {
        console.log('🔧 DEV MODE: Logging out');
        await AsyncStorage.removeItem(DEV_AUTH_KEY);
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (!auth) {
        throw new Error('Auth not initialized');
      }
      await signOut(auth);
      setUser(null);
      // Clear AsyncStorage
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register: registerUser,
    forgotPassword,
    loginWithGoogle,
    logout,
    isDevMode: DEV_MODE,
  };

  // Show loading screen while initializing
  if (initializing) {
    // Import dynamically to avoid circular dependency
    const LoadingScreen = require('@/components/LoadingScreen').default;
    return <LoadingScreen />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

