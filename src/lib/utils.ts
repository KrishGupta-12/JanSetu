import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { doc, getDoc, runTransaction, Firestore } from "firebase/firestore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function generateJanId(firestore: Firestore, userType: 'citizen' | 'admin' | 'super_admin'): Promise<string> {
    const counterRef = doc(firestore, 'counters', `${userType}_counter`);

    return runTransaction(firestore, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        
        let newCount;
        if (!counterDoc.exists()) {
            newCount = 1;
        } else {
            newCount = counterDoc.data().count + 1;
        }
        
        transaction.set(counterRef, { count: newCount });

        const year = new Date().getFullYear();
        const paddedCount = newCount.toString().padStart(4, '0');

        switch(userType) {
            case 'citizen':
                return `JAN-C-${year}-${paddedCount}`;
            case 'admin':
                return `JAN-A-${year}-${paddedCount}`;
            case 'super_admin':
                 return `JAN-K-2005-${paddedCount}`;
            default:
                throw new Error("Invalid user type for ID generation");
        }
    });
}
