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
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
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

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new AppError('Cloudinary deletion failed', 500);
  }
};
