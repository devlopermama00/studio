
'use client';

import { storage, firebaseConfig } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a file to Firebase Storage.
 * @param file The file to upload.
 * @param folder The folder in the storage bucket to upload to (e.g., 'profile-photos').
 * @returns The public download URL of the uploaded file.
 */
export const uploadFile = async (file: File, folder: string): Promise<string> => {
  if (!firebaseConfig.storageBucket) {
    throw new Error("Firebase Storage Bucket is not configured. Please set the NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable.");
  }

  // Generate a unique file name to prevent overwrites
  const fileName = `${uuidv4()}-${file.name}`;
  const path = `${folder}/${fileName}`;
  const storageRef = ref(storage, path);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
};
