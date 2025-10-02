
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { UserProfile, AdminCredential, ReportCategory, AdminRole } from '@/lib/types';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';


const demoAdmins: {[email: string]: AdminCredential} = {
    'super.admin@jancorp.com': { role: AdminRole.SuperAdmin },
    'waste.admin@jancorp.com': { role: AdminRole.DepartmentAdmin, department: ReportCategory.Waste },
    'pothole.admin@jancorp.com': { role: AdminRole.DepartmentAdmin, department: ReportCategory.Pothole },
    'streetlight.admin@jancorp.com': { role: AdminRole.DepartmentAdmin, department: ReportCategory.Streetlight },
};

type SignupData = {
    name: string;
    email: string;
    password: string;
    phone?: string;
    dob?: string;
    address?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { auth, firestore, isUserLoading: isFirebaseLoading } = useFirebase();

  const fetchUserProfile = useCallback(async (fbUser: FirebaseUser) => {
      setIsLoading(true);
      const userDocRef = doc(firestore, 'users', fbUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUser(userDoc.data() as UserProfile);
      } else {
        // If user exists in Auth but not in Firestore, create their profile
        await createUserProfile(fbUser);
      }
      setIsLoading(false);
  }, [firestore]);


  useEffect(() => {
    if (!auth) return;

    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await fetchUserProfile(fbUser);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, fetchUserProfile]);

  const createUserProfile = async (
    fbUser: FirebaseUser,
    additionalData: Partial<UserProfile> = {}
  ): Promise<UserProfile> => {
    const { uid, email, displayName } = fbUser;
    
    let roleData: Partial<UserProfile> = { role: null };
    
    // Check if the signing-up user is a pre-defined demo admin
    const demoAdminInfo = demoAdmins[email!];
    if (demoAdminInfo) {
        // This is a demo admin, let's ensure their credential exists in the /admins collection
        const adminRef = doc(firestore, 'admins', email!);
        const adminDoc = await getDoc(adminRef);

        if (!adminDoc.exists()) {
            // Document doesn't exist, so create it.
            await setDoc(adminRef, demoAdminInfo);
        }
        
        roleData = {
            role: demoAdminInfo.role,
            department: demoAdminInfo.department,
        };
    }

    const newUserProfile: UserProfile = {
        uid,
        name: additionalData.name || displayName || email?.split('@')[0] || 'Anonymous',
        email: email!,
        dateJoined: new Date().toISOString(),
        ...roleData,
        ...additionalData,
    };
    
    const userDocRef = doc(firestore, 'users', uid);
    // Use setDoc with merge to create or update the user profile
    await setDoc(userDocRef, newUserProfile, { merge: true });
    setUser(newUserProfile);
    return newUserProfile;
  };


  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Let the onAuthStateChanged listener handle profile fetching.
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // If user not found, try to sign them up as it could be a first-time demo user
         return signup({name: email.split('@')[0], email, password});
      }
      return { success: false, message: error.message || 'Invalid email or password.' };
    }
  };

  const signup = async (data: SignupData) => {
     try {
        const { name, email, password, ...additionalData } = data;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(userCredential.user, { name, ...additionalData });
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
