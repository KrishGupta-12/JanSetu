import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { doc, getDoc, runTransaction, Firestore } from "firebase/firestore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function generateJanId(firestore: Firestore, userType: 'citizen' | 'admin' | 'super_admin'): Promise<string> {
    const counterRef = doc(firestore, 'counters', `${userType}_counter`);

    try {
      const newCount = await runTransaction(firestore, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        
        let count = 1;
        if (counterDoc.exists()) {
            count = counterDoc.data().count + 1;
        }
        
        transaction.set(counterRef, { count: count }, { merge: true });
        return count;
      });

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
    } catch (error) {
      console.error("JanID generation failed: ", error);
      throw new Error("Could not generate a new JanID.");
    }
}
