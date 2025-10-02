'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase, useFirestore, useAuth as useFirebaseAuth } from '@/firebase';
import { UserProfile, AdminRole } from '@/lib/types';
import { generateJanId } from '@/lib/utils';
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

  const { auth, firestore, isUserLoading } = useFirebase();

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Fetch user profile from Firestore
        const userDocRef = doc(firestore, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        } else {
            // This case might happen if a user is created in Auth but not in Firestore
            setUser(null); 
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Invalid email or password.' };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
     try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { uid } = userCredential.user;
        const janId = await generateJanId(firestore, 'citizen');

        const newUserProfile: UserProfile = {
            uid,
            janId,
            name,
            email,
            phone: '',
            dateJoined: new Date().toISOString(),
        };
        
        await setDoc(doc(firestore, 'users', uid), newUserProfile);
        
        setUser(newUserProfile);

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
    <AuthContext.Provider value={{ user, firebaseUser, isLoading: isLoading || isUserLoading, login, signup, logout, updateUser }}>
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
