
'use client';

/**
 * Uploads a file by sending it to a server-side API endpoint for secure processing.
 * @param file The file to upload.
 * @param folder The target folder in Cloudinary.
 * @returns The public URL of the uploaded file.
 */
export const uploadFile = async (file: File, folder: string): Promise<string> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'File upload failed');
    }

    return data.url;

  } catch (error) {
    console.error("Error calling upload API:", error);
    if (error instanceof Error) {
        throw new Error(`File upload failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during file upload.");
  }
};
