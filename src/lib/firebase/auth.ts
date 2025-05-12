
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';
import type { LoginCredentials, SignUpCredentials } from '@/lib/types';

export const signUpWithEmail = async ({ email, password }: SignUpCredentials): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithEmail = async ({ email, password }: LoginCredentials): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const onAuthStateChangedObservable = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
