
import mongoose from 'mongoose';
import { Application } from './src/modules/application/application.schema';
import dotenv from 'dotenv';
import { User } from './src/modules/user/user.schema';

dotenv.config();

const debugApplications = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        const apps = await Application.find({})
            .populate('submittedBy', 'name email')
            .populate('to', 'name email role permissions')
            .populate('medium', 'name email role permissions')
            .populate('l0Reviewer', 'name email role permissions')
            .sort({ createdAt: -1 });

        console.log(`Found ${apps.length} applications.`);

        apps.forEach(app => {
            console.log('------------------------------------------------');
            console.log(`ID: ${app._id}`);
            console.log(`Title: ${app.title}`);
            console.log(`Status: ${app.status}`);
            console.log(`Submitted By: ${(app.submittedBy as any)?.email}`);
            console.log(`To (L2): ${(app.to as any)?.email} [Role: ${(app.to as any)?.role}]`);
            console.log(`Medium (L1): ${(app.medium as any)?.email || 'None'} [Role: ${(app.medium as any)?.role || 'N/A'}]`);
            console.log(`L0 Reviewer: ${(app.l0Reviewer as any)?.email || 'None'}`);
            console.log('------------------------------------------------');
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        if (mongoose.connection.readyState === 1) {
             await mongoose.disconnect();
        }
    }
};

debugApplications();
