import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../src/modules/user/user.schema';
import { UserRole, UserStatus } from '../src/modules/user/user.types';
import { env } from '../src/config/env';

const seedAdmin = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to database...');

    const adminEmail = 'admin@sust.edu';
    const plainPassword = 'adminpassword123';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const adminData = {
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      phone: '01711111111',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
    };

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists, updating credentials...');
      await User.updateOne(
        { email: adminEmail },
        {
          $set: {
            name: adminData.name,
            password: hashedPassword,
            status: UserStatus.ACTIVE,
            isEmailVerified: true,
            role: UserRole.ADMIN
          }
        }
      );
      console.log('Admin details updated successfully.');
    } else {
      await User.create(adminData);
      console.log(' Admin user created successfully!');
    }

    console.log('-----------------------------------');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${plainPassword}`);
    console.log('-----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();