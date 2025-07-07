'use client';

import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a file to Firebase Storage.
 * @param file The file to upload.
 * @param folder The folder in Firebase Storage to upload to.
 * @returns The public downloadable URL of the uploaded file.
 */
export const uploadFile = async (file: File, folder: string): Promise<string> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
    throw new Error("Firebase Storage bucket is not configured. Please set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in your .env.local file.");
  }

  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);

  try {
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading to Firebase Storage:", error);
    if (error instanceof Error) {
        throw new Error(`Firebase upload failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during file upload.");
  }
};
