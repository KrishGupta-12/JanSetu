'use server';

import { Auth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, Firestore } from 'firebase/firestore';
import { generateJanId } from './utils';
import { AdminRole, ReportCategory } from './types';
import { FirebaseError } from 'firebase/app';

const adminsToSeed = [
    {
        email: 'super.admin@jancorp.com',
        password: 'superadmin123',
        name: 'Municipal Head',
        role: AdminRole.SuperAdmin,
    },
    {
        email: 'waste.admin@jancorp.com',
        password: 'admin123',
        name: 'Waste Dept Head',
        role: AdminRole.DepartmentAdmin,
        department: ReportCategory.Waste,
    },
    {
        email: 'pothole.admin@jancorp.com',
        password: 'admin123',
        name: 'Pothole Dept Head',
        role: AdminRole.DepartmentAdmin,
        department: ReportCategory.Pothole,
    },
    {
        email: 'streetlight.admin@jancorp.com',
        password: 'admin123',
        name: 'Streetlight Dept Head',
        role: AdminRole.DepartmentAdmin,
        department: ReportCategory.Streetlight,
    },
];

async function createOrGetAdmin(auth: Auth, firestore: Firestore, adminInfo: any): Promise<User | null> {
    try {
        // Try to sign in. If successful, the user exists.
        const userCredential = await signInWithEmailAndPassword(auth, adminInfo.email, adminInfo.password);
        return userCredential.user;
    } catch (error) {
        if (error instanceof FirebaseError && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
            // User does not exist, so create them.
            const userCredential = await createUserWithEmailAndPassword(auth, adminInfo.email, adminInfo.password);
            const adminUser = userCredential.user;

            const userType = adminInfo.role === AdminRole.SuperAdmin ? 'super_admin' : 'admin';
            const janId = await generateJanId(firestore, userType);

            const adminRef = doc(firestore, 'admins', adminUser.uid);
            await setDoc(adminRef, {
                id: adminUser.uid,
                janId: janId,
                name: adminInfo.name,
                email: adminInfo.email,
                role: adminInfo.role,
                department: adminInfo.department || null,
                dateJoined: new Date().toISOString(),
            });

            console.log(`Successfully created admin: ${adminInfo.email}`);
            return adminUser;
        } else {
            // Rethrow other errors
            console.error(`Error checking/creating admin ${adminInfo.email}:`, error);
            throw error;
        }
    }
}

export async function seedAdminUsers(auth: Auth, firestore: Firestore) {
    console.log('Starting to seed admin users...');
    const originalUser = auth.currentUser;
    
    // Temporarily sign out the current user if they exist to perform seeding
    if (originalUser) {
        await signOut(auth);
    }

    for (const admin of adminsToSeed) {
        try {
            await createOrGetAdmin(auth, firestore, admin);
             // Sign out after each operation to ensure a clean state for the next one
            if (auth.currentUser) {
                await signOut(auth);
            }
        } catch (error) {
            console.error(`Failed to process admin ${admin.email}.`);
        }
    }

    // After seeding, the user is signed out. The user will need to log in manually.
    console.log('Admin user seeding complete. Please log in.');
}
