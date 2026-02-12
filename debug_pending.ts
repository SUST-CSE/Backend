import mongoose from 'mongoose';
import { Application } from './src/modules/application/application.schema';
import { ApplicationStatus } from './src/modules/application/application.types';
import dotenv from 'dotenv';

dotenv.config();

const debugPendingApps = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB\n');

    // Count all applications by status
    const allApps = await Application.find({});
    console.log(`Total Applications: ${allApps.length}`);
    
    const statusCounts = {
      PENDING_L0: 0,
      PENDING_L1: 0,
      PENDING_L2: 0,
      APPROVED: 0,
      REJECTED: 0,
      OTHER: 0
    };

    allApps.forEach(app => {
      if (app.status === ApplicationStatus.PENDING_L0) statusCounts.PENDING_L0++;
      else if (app.status === ApplicationStatus.PENDING_L1) statusCounts.PENDING_L1++;
      else if (app.status === ApplicationStatus.PENDING_L2) statusCounts.PENDING_L2++;
      else if (app.status === ApplicationStatus.APPROVED) statusCounts.APPROVED++;
      else if (app.status === ApplicationStatus.REJECTED) statusCounts.REJECTED++;
      else statusCounts.OTHER++;
    });

    console.log('\nStatus Breakdown:');
    console.log('  PENDING_L0:', statusCounts.PENDING_L0);
    console.log('  PENDING_L1:', statusCounts.PENDING_L1);
    console.log('  PENDING_L2:', statusCounts.PENDING_L2);
    console.log('  APPROVED:', statusCounts.APPROVED);
    console.log('  REJECTED:', statusCounts.REJECTED);
    console.log('  OTHER:', statusCounts.OTHER);

    // Show recent pending apps
    console.log('\n--- Recent Pending Applications ---');
    const pendingApps = await Application.find({
      status: { $in: [ApplicationStatus.PENDING_L0, ApplicationStatus.PENDING_L1, ApplicationStatus.PENDING_L2] }
    })
      .populate('submittedBy', 'name email')
      .populate('to', 'name email')
      .populate('medium', 'name email')
      .limit(5)
      .sort({ createdAt: -1 });

    pendingApps.forEach(app => {
      console.log(`\nTitle: ${app.title}`);
      console.log(`Status: ${app.status}`);
      console.log(`Submitted By: ${(app.submittedBy as any)?.email}`);
      console.log(`To (L2): ${(app.to as any)?.email}`);
      console.log(`Medium (L1): ${(app.medium as any)?.email || 'None'}`);
      console.log(`Attachments: ${app.attachments?.length || 0} files`);
      if (app.attachments && app.attachments.length > 0) {
        app.attachments.forEach((url, i) => {
          console.log(`  - Attachment ${i + 1}: ${url.substring(0, 80)}...`);
        });
      }
    });

    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
};

debugPendingApps();
