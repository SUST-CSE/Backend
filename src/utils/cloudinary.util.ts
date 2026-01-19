import cloudinary from '@/config/cloudinary';
import { AppError } from './errors/AppError';

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string
): Promise<{ url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(new AppError('Cloudinary upload failed', 500));
        resolve({
          url: result!.secure_url,
          public_id: result!.public_id,
        });
      }
    );
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
