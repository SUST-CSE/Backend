import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../src/modules/user/user.schema';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const diagnoseUser = async () => {
  const email = '2021331014@student.sust.edu';
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Find with filters disabled to see if it's hidden
    const anyUser = await mongoose.connection.collection('users').findOne({ email });
    console.log('📦 Raw MongoDB Document:', anyUser);

    const userDoc = await User.findOne({ email }).select('+password +verificationCode');
    console.log('👤 Mongoose User Object Found:', !!userDoc);
    if (userDoc) {
      console.log('🆔 _id:', userDoc._id);
      console.log('🗑️ isDeleted:', userDoc.isDeleted);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
  }
};

diagnoseUser();
