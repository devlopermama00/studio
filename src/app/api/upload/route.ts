
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
  const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;
  const resourceType = file.type.startsWith('video') ? 'video' : 'image';

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folder,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      resource_type: resourceType,
    });
    
    if (!result.secure_url) {
      throw new Error("Upload to Cloudinary failed, secure_url not returned.");
    }

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown upload error";
    return NextResponse.json({ error: "Upload failed", details: errorMessage }, { status: 500 });
  }
}
