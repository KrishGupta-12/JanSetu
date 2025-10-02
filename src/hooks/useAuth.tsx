'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useFirebase, useFirestore } from '@/firebase';
import { UserProfile } from '@/lib/types';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { mockAdmins } from '@/lib/data'; 

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
        const userDocRef = doc(firestore, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        } else {
            const mockAdmin = mockAdmins.find(admin => admin.email === fbUser.email);
            if (mockAdmin) {
                const newAdminProfile: UserProfile = {
                    ...mockAdmin,
                    uid: fbUser.uid,
                    dateJoined: new Date().toISOString(),
                };
                setDocumentNonBlocking(userDocRef, newAdminProfile, { merge: false });
                setUser(newAdminProfile);
            } else {
                 setUser(null); 
            }
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
      const mockAdmin = mockAdmins.find(admin => admin.email === email);
      if (mockAdmin && error.code === 'auth/user-not-found') {
          try {
              const userCredential = await createUserWithEmailAndPassword(auth, email, password);
              const { uid } = userCredential.user;
              const newAdminProfile: UserProfile = { ...mockAdmin, uid, dateJoined: new Date().toISOString() };
              const userDocRef = doc(firestore, 'users', uid);
              setDocumentNonBlocking(userDocRef, newAdminProfile, { merge: false });
              setUser(newAdminProfile);
              return { success: true, message: 'Admin account created and logged in.' };
          } catch (signupError: any) {
              return { success: false, message: signupError.message };
          }
      }
      return { success: false, message: error.message || 'Invalid email or password.' };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
     try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { uid } = userCredential.user;

        const newUserProfile: UserProfile = {
            uid,
            name,
            email,
            phone: '',
            dateJoined: new Date().toISOString(),
        };
        
        const userDocRef = doc(firestore, 'users', uid);
        await setDoc(userDocRef, newUserProfile, { merge: false });
        
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
