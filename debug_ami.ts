
import mongoose from 'mongoose';
import { User } from './src/modules/user/user.schema';
import { Application } from './src/modules/application/application.schema';
import dotenv from 'dotenv';

dotenv.config();

const debugAmi = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    
    // Find User Ami
    const ami = await User.findOne({ name: { $regex: 'Ami', $options: 'i' } });
    if (!ami) {
        console.log('❌ User "Ami" not found.');
    } else {
        console.log('✅ User "Ami" found:', ami.email);
        console.log('   Role:', ami.role);
        console.log('   Permissions:', ami.permissions);
        console.log('   ID:', ami._id);
        console.log('   Signature:', ami.signatureUrl ? 'Yes' : 'No');
    }

    // Find Pending L1 Applications where Medium is Ami
    if (ami) {
        const apps = await Application.find({ medium: ami._id })
            .populate('submittedBy', 'name')
            .populate('l0Reviewer', 'name');
            
        console.log(`\nFound ${apps.length} applications where Ami is Medium.`);
        apps.forEach(app => {
            console.log(`- Title: ${app.title}`);
            console.log(`  Status: ${app.status}`);
            console.log(`  L0 Reviewer in DB: ${app.l0Reviewer}`);
            console.log(`  Trail L0:`, app.approvalTrail?.l0);
        });
    }

    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
  }
};

debugAmi();
