
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { UserProfile, AdminCredential, ReportCategory, AdminRole } from '@/lib/types';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';


const getDepartmentFromRole = (role: AdminRole): ReportCategory | undefined => {
    switch (role) {
        case AdminRole.WasteAdmin: return ReportCategory.Waste;
        case AdminRole.PotholeAdmin: return ReportCategory.Pothole;
        case AdminRole.StreetlightAdmin: return ReportCategory.Streetlight;
        case AdminRole.WaterAdmin: return ReportCategory.Water;
        default: return undefined;
    }
}

type SignupData = {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
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
        const profileData = userDoc.data() as UserProfile;
        // If it's a department admin, ensure department is set from role
        if(profileData.role && profileData.role !== AdminRole.SuperAdmin) {
            profileData.department = getDepartmentFromRole(profileData.role);
        }
        setUser(profileData);
      } else {
        // This case would be for a first-time login for a pre-provisioned auth user
        // or if a user's profile document was deleted.
        // We'll create a basic profile.
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
    
    // All new signups are citizens
    const newUserProfile: UserProfile = {
        uid,
        name: additionalData.name || displayName || email?.split('@')[0] || 'Anonymous',
        email: email!,
        phone: additionalData.phone || '',
        address: additionalData.address || '',
        dateJoined: new Date().toISOString(),
        role: null, // New users are always citizens
    };
    
    const userDocRef = doc(firestore, 'users', uid);
    await setDoc(userDocRef, newUserProfile, { merge: true });
    setUser(newUserProfile);
    return newUserProfile;
  };


  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
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

  return (
    <AuthContext.Provider value={{ user, firebaseUser, isLoading: isLoading || isFirebaseLoading, login, signup, logout }}>
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
