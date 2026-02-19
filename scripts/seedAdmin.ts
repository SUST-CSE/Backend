import mongoose from 'mongoose';
import { User } from '../src/modules/user/user.schema';
import { UserRole } from '../src/modules/user/user.types';
import { env } from '../src/config/env';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('connected to database...');

    const adminEmail = 'admin@sust.edu';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    const adminData = {
      name: 'Super Admin',
      email: adminEmail,
      password: 'adminpassword123',
      phone: '01711111111',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
    };

    await User.create(adminData);
    console.log(' Admin user created successfully!');
    console.log('Email: admin@sust.edu');
    console.log('Password: adminpassword123');

    process.exit(0);
  } catch (error) {
    console.error(' Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
