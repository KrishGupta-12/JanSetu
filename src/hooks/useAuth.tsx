
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { UserProfile, ReportCategory, UserRole } from '@/lib/types';

const getDepartmentFromRole = (role: UserRole): ReportCategory | undefined => {
    switch (role) {
        case UserRole.WasteAdmin: return ReportCategory.Waste;
        case UserRole.PotholeAdmin: return ReportCategory.Pothole;
        case UserRole.StreetlightAdmin: return ReportCategory.Streetlight;
        case UserRole.WaterAdmin: return ReportCategory.Water;
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

  const { auth, firestore } = useFirebase();

  const fetchUserProfile = useCallback(async (fbUser: FirebaseUser) => {
      const userDocRef = doc(firestore, 'users', fbUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        if(profileData.role && profileData.role !== UserRole.SuperAdmin && profileData.role !== UserRole.Citizen) {
            profileData.department = getDepartmentFromRole(profileData.role);
        }
        setUser(profileData);
      } else {
        // This case can happen if the user record is deleted from Firestore but not Auth
        console.warn(`No user profile found for UID: ${fbUser.uid}. Logging out.`);
        signOut(auth);
      }
  }, [firestore, auth]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setIsLoading(true);
        await fetchUserProfile(fbUser);
        setIsLoading(false);
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
    
    const newUserProfile: UserProfile = {
        uid,
        name: additionalData.name || displayName || email?.split('@')[0] || 'Anonymous',
        email: email!,
        phone: additionalData.phone || '',
        address: additionalData.address || '',
        dateJoined: new Date().toISOString(),
        role: UserRole.Citizen, 
    };
    
    const userDocRef = doc(firestore, 'users', uid);
    await setDoc(userDocRef, newUserProfile, { merge: true });
    setUser(newUserProfile);
    return newUserProfile;
  };


  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle fetching the profile
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
    <AuthContext.Provider value={{ user, firebaseUser, isLoading, login, signup, logout }}>
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
