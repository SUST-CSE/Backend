import cloudinary from '../config/cloudinary';
import { AppError } from './errors/AppError';

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string
): Promise<{ secure_url: string; public_id: string; format?: string }> => {
  console.log('=== uploadToCloudinary called ===');
  console.log('Folder:', folder);
  console.log('File:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    bufferLength: file.buffer?.length
  });
  
  if (!file.buffer || file.buffer.length === 0) {
    console.error('❌ uploadToCloudinary error: Empty file buffer');
    throw new AppError('File buffer is empty or missing', 400);
  }

  // Determine resource type based on MIME type
  // PDFs and other documents should use 'raw', images use 'image'
  let resourceType: 'auto' | 'image' | 'raw' = 'auto';
  if (file.mimetype === 'application/pdf' || file.originalname?.toLowerCase().endsWith('.pdf')) {
    resourceType = 'raw';
    console.log('📄 Detected PDF - using resource_type: raw');
  } else if (file.mimetype?.startsWith('image/')) {
    resourceType = 'image';
    console.log('🖼️ Detected image - using resource_type: image');
  }
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload_stream error:', error);
          return reject(new AppError('Cloudinary upload failed', 500));
        }
        console.log('Cloudinary upload_stream success:', result?.secure_url);
        resolve({
          secure_url: result!.secure_url,
          public_id: result!.public_id,
          format: result?.format,
        });
      }
    );
    
    console.log('Writing buffer to upload stream...');
    uploadStream.end(file.buffer);
  });
};

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder: string,
  mimetype: string,
  filename?: string
): Promise<{ secure_url: string; public_id: string; format?: string }> => {
  let resourceType: 'auto' | 'image' | 'raw' = 'auto';
  if (mimetype === 'application/pdf' || filename?.toLowerCase().endsWith('.pdf')) {
    resourceType = 'raw';
  } else if (mimetype?.startsWith('image/')) {
    resourceType = 'image';
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) {
          return reject(new AppError('Cloudinary upload failed', 500));
        }
        resolve({
          secure_url: result!.secure_url,
          public_id: result!.public_id,
          format: result?.format,
        });
      }
    );
    uploadStream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new AppError('Cloudinary deletion failed', 500);
  }
};
