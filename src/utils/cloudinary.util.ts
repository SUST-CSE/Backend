import cloudinary from '../config/cloudinary';
// FORCE RELOAD V4 - ENSURING RAW RESOURCE TYPE
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
  let resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto';
  const isPDF = file.mimetype === 'application/pdf' || file.originalname?.toLowerCase().endsWith('.pdf');

  if (isPDF) {
    resourceType = 'raw';
    console.log('📄 Detected PDF - using resource_type: raw');
  } else if (file.mimetype?.startsWith('image/')) {
    resourceType = 'image';
  }

  // Build upload options
  const uploadOptions: any = { folder, resource_type: resourceType };

  if (file.originalname) {
    let publicId = file.originalname
      .replace(/\.[^/.]+$/, "") // Remove original extension
      .replace(/\s+/g, '_');    // Replace spaces with underscores

    // For raw files (like PDFs), the extension must be part of the public_id
    if (isPDF) {
      publicId += '.pdf';
    }

    uploadOptions.public_id = publicId;
  }

  console.log('🚀 Final Cloudinary Upload Options:', uploadOptions);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload_stream error:', error);
          return reject(new AppError('Cloudinary upload failed', 500));
        }
        console.log('Cloudinary upload_stream success. Result URL:', result?.secure_url);
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
  // Determine resource type based on MIME type
  let resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto';
  const isPDF = mimetype === 'application/pdf' || filename?.toLowerCase().endsWith('.pdf');

  if (isPDF) {
    resourceType = 'raw';
    console.log('📄 Detected PDF - using resource_type: raw');
  } else if (mimetype?.startsWith('image/')) {
    resourceType = 'image';
  }

  // Build upload options
  const uploadOptions: any = { folder, resource_type: resourceType };

  if (filename) {
    let publicId = filename
      .replace(/\.[^/.]+$/, "") // Remove original extension if present
      .replace(/\s+/g, '_');    // Replace spaces with underscores

    // For raw files (like PDFs), the extension must be part of the public_id
    if (isPDF) {
      publicId += '.pdf';
    }

    uploadOptions.public_id = publicId;
  }

  console.log('🚀 Final Cloudinary (Buffer) Upload Options:', uploadOptions);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload_stream error:', error);
          return reject(new AppError('Cloudinary upload failed', 500));
        }
        console.log('Cloudinary upload_stream success. Result URL:', result?.secure_url);
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
