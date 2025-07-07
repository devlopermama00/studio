
import { NextResponse, type NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const folder = formData.get('folder') as string;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const resourceType = file.type.startsWith('video') ? 'video' : 'image';

    const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: folder,
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
            resource_type: resourceType,
        }, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
        uploadStream.end(buffer);
    });
    
    const uploadResult = result as { secure_url?: string };

    if (!uploadResult.secure_url) {
         throw new Error("Upload failed, secure_url not returned.");
    }

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown upload error";
    return NextResponse.json({ error: "Upload failed", details: errorMessage }, { status: 500 });
  }
}
