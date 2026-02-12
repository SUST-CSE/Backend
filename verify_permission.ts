
import mongoose from 'mongoose';
import { User } from './src/modules/user/user.schema';
import dotenv from 'dotenv';

dotenv.config();

const verifyPermissionSave = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // specific test user or create a temp one
        const testEmail = 'test_perm_check_001@example.com';
        await User.deleteOne({ email: testEmail });
        
        const user = await User.create({
            name: 'Test Permission',
            email: testEmail,
            password: 'password123',
            phone: '1234567890',
            role: 'TEACHER', // or STUDENT
            permissions: []
        });

        console.log('User created:', user.email);

        // Try to update permission
        user.permissions.push('APPROVE_APPLICATION_L0');
        await user.save();

        const updatedUser = await User.findOne({ email: testEmail });
        if (updatedUser?.permissions.includes('APPROVE_APPLICATION_L0')) {
            console.log('SUCCESS: APPROVE_APPLICATION_L0 permission saved successfully.');
        } else {
            console.error('FAILURE: Permission was NOT saved.');
            console.log('Current permissions:', updatedUser?.permissions);
        }

        await User.deleteOne({ email: testEmail });
        await mongoose.disconnect();

    } catch (error) {
        console.error('Error:', error);
        if (mongoose.connection.readyState === 1) {
             await mongoose.disconnect();
        }
    }
};

verifyPermissionSave();
