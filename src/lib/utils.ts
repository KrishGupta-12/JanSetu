import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { doc, getDoc, runTransaction, Firestore } from "firebase/firestore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
