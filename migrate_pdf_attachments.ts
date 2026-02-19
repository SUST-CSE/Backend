import mongoose from 'mongoose';
import https from 'https';
import cloudinary from './src/config/cloudinary';
import { Application } from './src/modules/application/application.schema';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Helper function to download a file as buffer using https
 */
const downloadFile = (url: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download: ${response.statusCode}`));
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
};

/**
 * Migration script to fix PDF attachments that were uploaded with wrong resource_type
 * Identifies PDFs with /image/upload/ URLs and re-uploads them as /raw/upload/
 */
const migratePDFAttachments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB\n');

    // Find all applications with attachments
    const applications = await Application.find({
      attachments: { $exists: true, $ne: [] }
    });

    console.log(`📋 Found ${applications.length} applications with attachments\n`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const app of applications) {
      if (!app.attachments || app.attachments.length === 0) continue;

      const updatedAttachments: string[] = [];
      let hasChanges = false;

      for (let i = 0; i < app.attachments.length; i++) {
        const url = app.attachments[i];

        // Check if this is a PDF with wrong resource type (image/upload instead of raw/upload)
        const isPDFWithWrongType = url.includes('/image/upload/') &&
          (url.toLowerCase().endsWith('.pdf') || url.includes('.pdf'));

        if (isPDFWithWrongType) {
          console.log(`🔄 Migrating PDF for application: ${app.title}`);
          console.log(`   Old URL: ${url}`);

          try {
            // Download the PDF from Cloudinary
            const buffer = await downloadFile(url);

            // Extract the public_id from the URL
            const urlParts = url.split('/');
            const uploadIndex = urlParts.indexOf('upload');
            const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
            const oldPublicId = pathAfterUpload.replace(/\.[^/.]+$/, ''); // Remove extension

            // Upload with correct resource_type: 'raw'
            const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  folder: 'sust-cse/applications',
                  resource_type: 'raw'
                },
                (error, result) => {
                  if (error) {
                    return reject(error);
                  }
                  resolve({
                    secure_url: result!.secure_url,
                    public_id: result!.public_id,
                  });
                }
              );
              uploadStream.end(buffer);
            });

            console.log(`   New URL: ${uploadResult.secure_url}`);
            updatedAttachments.push(uploadResult.secure_url);
            hasChanges = true;
            migratedCount++;

            // Try to delete the old file (with image resource type)
            try {
              await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'image' });
              console.log(`   Deleted old file: ${oldPublicId}`);
            } catch (deleteError) {
              console.log(`   ⚠️  Could not delete old file (may not exist): ${oldPublicId}`);
            }

          } catch (error: any) {
            console.error(`    Error migrating attachment: ${error.message}`);
            // Keep the old URL if migration fails
            updatedAttachments.push(url);
            errorCount++;
          }
        } else {
          // Not a PDF with wrong type, keep as is
          updatedAttachments.push(url);
        }
      }

      // Update the application if there were changes
      if (hasChanges) {
        app.attachments = updatedAttachments;
        await app.save();
        console.log(`   💾 Updated application: ${app._id}\n`);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${migratedCount} PDFs`);
    console.log(`   ❌ Errors: ${errorCount} PDFs`);
    console.log(`   📄 Total applications processed: ${applications.length}`);

    await mongoose.disconnect();
    console.log('\n✅ Migration completed. Disconnected from MongoDB.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

migratePDFAttachments();
