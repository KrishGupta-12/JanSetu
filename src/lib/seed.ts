'use server';

import { Auth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, Firestore, getDoc } from 'firebase/firestore';
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
        const adminRefCheck = doc(firestore, 'admins', adminInfo.email); // Use email as a temporary check ID
        const adminSnap = await getDoc(adminRefCheck);
        if (adminSnap.exists()) {
             // To avoid re-creating, let's try signing in to get the user object.
             // This part is tricky because we don't have the UID yet.
             // A better approach is to have a separate collection to check for seeded emails.
             // For now, we assume if the email record exists, we can try to sign in.
            try {
                const userCredential = await signInWithEmailAndPassword(auth, adminInfo.email, adminInfo.password);
                console.log(`Admin already exists: ${adminInfo.email}`);
                await signOut(auth); // Sign out immediately
                return userCredential.user;
            } catch (e) {
                 // Ignore sign-in errors if user exists but pwd is wrong, etc. The goal is to avoid recreation.
                 console.log(`Could not sign in existing admin ${adminInfo.email}, but skipping creation.`);
                 return null;
            }
        }

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

        // Create a separate doc to quickly check if email has been seeded
        await setDoc(doc(firestore, 'seeded_admins', adminInfo.email), { seeded: true });

        console.log(`Successfully created admin: ${adminInfo.email}`);
        
        // IMPORTANT: Sign out after creation to not affect subsequent operations or user sessions
        await signOut(auth);

        return adminUser;
        
    } catch (error) {
        if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
             console.log(`Admin email ${adminInfo.email} already in use. Skipping creation.`);
        } else {
            console.error(`Error creating admin ${adminInfo.email}:`, error);
        }
        // Ensure we are signed out in case of any other error
        if (auth.currentUser) {
            await signOut(auth);
        }
        return null;
    }
}

export async function seedAdminUsers(auth: Auth, firestore: Firestore) {
    console.log('Starting to seed admin users...');
    const originalUser = auth.currentUser;
    
    if (originalUser) {
        await signOut(auth);
    }

    for (const admin of adminsToSeed) {
        await createOrGetAdmin(auth, firestore, admin);
    }
    
    // After seeding, ensure we are signed out.
    // The login flow will handle re-authenticating the original user if needed.
    console.log('Admin user seeding process complete.');
}
