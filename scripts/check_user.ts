import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../src/modules/user/user.schema';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const checkUser = async () => {
  const email = process.argv[2];
  if (!email) {
    console.error('Please provide an email');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email }).select('+verificationCode +verificationCodeExpires');
    if (!user) {
      console.log('User not found');
    } else {
      console.log('User found:');
      console.log('Email:', user.email);
      console.log('Is Verified:', user.isEmailVerified);
      console.log('Verification Code:', (user as any).verificationCode);
      console.log('Expires:', (user as any).verificationCodeExpires);
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
};

checkUser();
