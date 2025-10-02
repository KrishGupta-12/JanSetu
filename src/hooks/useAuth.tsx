
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { UserProfile, AdminCredential } from '@/lib/types';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { auth, firestore, isUserLoading: isFirebaseLoading } = useFirebase();

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setIsLoading(true);
        const userDocRef = doc(firestore, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const createUserProfile = async (
    fbUser: FirebaseUser,
    additionalData: Partial<UserProfile> = {}
  ): Promise<UserProfile> => {
    const { uid, email, displayName } = fbUser;
    
    // Check if the user is a designated admin
    const adminRef = doc(firestore, 'admins', email!);
    const adminDoc = await getDoc(adminRef);

    let roleData: Partial<UserProfile> = { role: null };
    if (adminDoc.exists()) {
        const adminInfo = adminDoc.data() as AdminCredential;
        roleData = {
            role: adminInfo.role,
            department: adminInfo.department,
        };
    }

    const newUserProfile: UserProfile = {
        uid,
        name: additionalData.name || displayName || email || 'Anonymous',
        email: email!,
        dateJoined: new Date().toISOString(),
        ...roleData,
        ...additionalData,
    };
    
    const userDocRef = doc(firestore, 'users', uid);
    await setDoc(userDocRef, newUserProfile, { merge: true });
    setUser(newUserProfile);
    return newUserProfile;
  };


  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Let the onAuthStateChanged listener handle profile fetching.
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Invalid email or password.' };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
     try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(userCredential.user, { name });
        return { success: true, message: "Signup successful" };
     } catch(error: any) {
        return { success: false, message: error.message || "Email already in use." };
     }
  };

  const logout = () => {
    signOut(auth);
  };
  
  const updateUser = useCallback((updatedData: Partial<UserProfile>) => {
      if (!user) return;
      const userDocRef = doc(firestore, 'users', user.uid);
      setDocumentNonBlocking(userDocRef, updatedData, { merge: true });
      setUser(prev => prev ? { ...prev, ...updatedData } : null);
  }, [user, firestore]);


  return (
    <AuthContext.Provider value={{ user, firebaseUser, isLoading: isLoading || isFirebaseLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
