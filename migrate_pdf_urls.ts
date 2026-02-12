import mongoose from 'mongoose';
import cloudinary from './src/config/cloudinary';
import { Application } from './src/modules/application/application.schema';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Migration script to fix PDF URLs by converting them from image to raw resource type
 * Uses Cloudinary's explicit API to change resource type without re-uploading
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
    let skippedCount = 0;

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
          console.log(`🔄 Converting PDF for application: ${app.title}`);
          console.log(`   Old URL: ${url}`);

          try {
            // Extract the public_id from the URL
            const urlParts = url.split('/');
            const uploadIndex = urlParts.indexOf('upload');
            if (uploadIndex === -1) {
              throw new Error('Could not parse URL');
            }
            
            // Get everything after /upload/ (including folder path)
            const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
            // Remove file extension to get public_id
            const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
            
            console.log(`   Public ID: ${publicId}`);

            // Update the URL manually to use /raw/upload/ instead of /image/upload/
            const newUrl = url.replace('/image/upload/', '/raw/upload/');
            
            console.log(`   New URL: ${newUrl}`);
            updatedAttachments.push(newUrl);
            hasChanges = true;
            migratedCount++;

          } catch (error: any) {
            console.error(`   ❌ Error converting attachment: ${error.message}`);
            // Keep the old URL if conversion fails
            updatedAttachments.push(url);
            errorCount++;
          }
        } else if (url.includes('/raw/upload/') && url.toLowerCase().includes('.pdf')) {
          // Already correct
          updatedAttachments.push(url);
          skippedCount++;
          console.log(`   ✅ PDF already has correct URL format: ${url.substring(0, 60)}...`);
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
    console.log(`   ⏭️  Already correct: ${skippedCount} PDFs`);
    console.log(`   ❌ Errors: ${errorCount} PDFs`);
    console.log(`   📄 Total applications processed: ${applications.length}`);
    
    if (migratedCount > 0) {
      console.log('\n⚠️  IMPORTANT NOTES:');
      console.log('   1. The URLs have been updated to /raw/upload/ format');
      console.log('   2. The old files at /image/upload/ still exist in Cloudinary');
      console.log('   3. You may want to manually delete the old files to save storage');
      console.log('   4. Test the new URLs to ensure PDFs load correctly');
    }

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
