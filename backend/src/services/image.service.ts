import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Cloudinary configuration (sandbox/production credentials from .env)
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

const isCloudinaryConfigured = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface UploadResult {
  url: string;
  publicId?: string;
  provider: 'CLOUDINARY' | 'LOCAL';
  sizeBytes: number;
}

export const uploadProductImage = async (
  fileBuffer: Buffer,
  originalFilename: string,
  mimetype: string
): Promise<UploadResult> => {
  // 1. Validation: Mime-type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedMimeTypes.includes(mimetype.toLowerCase())) {
    throw new Error(`Invalid image format (${mimetype}). Only JPEG, PNG, and WebP are permitted.`);
  }

  // 2. Validation: Max size 5MB
  const MAX_SIZE = 5 * 1024 * 1024;
  if (fileBuffer.length > MAX_SIZE) {
    throw new Error(`Image size (${Math.round(fileBuffer.length / 1024 / 1024)}MB) exceeds 5MB limit.`);
  }

  // 3. Cloudinary Upload if configured
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'recircuit/products',
          resource_type: 'image',
          transformation: [{ width: 1200, crop: 'limit', quality: 'auto:good' }],
        },
        (error, result) => {
          if (error || !result) {
            return reject(new Error(error?.message || 'Cloudinary upload failed'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            provider: 'CLOUDINARY',
            sizeBytes: result.bytes || fileBuffer.length,
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  // 4. Secure Local Fallback Storage
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const safeExtension = mimetype === 'image/png' ? 'png' : mimetype === 'image/webp' ? 'webp' : 'jpg';
  const filename = `product-${Date.now()}-${Math.floor(Math.random() * 10000)}.${safeExtension}`;
  const filePath = path.join(uploadsDir, filename);

  fs.writeFileSync(filePath, fileBuffer);

  return {
    url: `/uploads/${filename}`,
    provider: 'LOCAL',
    sizeBytes: fileBuffer.length,
  };
};

