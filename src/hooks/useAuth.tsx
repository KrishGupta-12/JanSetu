'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { mockCitizens, mockAdmins } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => { success: boolean; message: string };
  signup: (name: string, email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const allMockUsers = [...mockCitizens, ...mockAdmins];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a logged-in user from a cookie or localStorage
    try {
      const storedUser = localStorage.getItem('jan-setu-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse stored user", error)
      localStorage.removeItem('jan-setu-user');
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const foundUser = allMockUsers.find(u => u.email === email);
    
    // In a real app, you'd check the password. Here, any password works for a known user.
    if (foundUser && password === 'admin123') {
      const userToStore = { ...foundUser };
      setUser(userToStore);
      localStorage.setItem('jan-setu-user', JSON.stringify(userToStore));
      return { success: true, message: 'Login successful' };
    }
    return { success: false, message: 'Invalid email or password.' };
  };

  const signup = (name: string, email: string, password: string) => {
     const existingUser = allMockUsers.find(u => u.email === email);
     if (existingUser) {
         return { success: false, message: "Email already in use." };
     }

     const newUser: User = {
         id: `user-${Date.now()}`,
         janId: `JAN-C-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
         name,
         email,
         phone: '',
         dateJoined: new Date().toISOString()
     };
     
     // In a real app, you would save this to the DB. Here we just set it in context.
     setUser(newUser);
     localStorage.setItem('jan-setu-user', JSON.stringify(newUser));
     // You might want to add the new user to the mock array in memory for this session
     // but that can get complicated. For now, this is enough for the user to be "logged in".

     return { success: true, message: "Signup successful" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jan-setu-user');
  };
  
  const updateUser = (updatedUser: User) => {
      setUser(updatedUser);
      localStorage.setItem('jan-setu-user', JSON.stringify(updatedUser));
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUser }}>
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
