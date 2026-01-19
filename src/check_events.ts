import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Event } from './modules/event/event.schema';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const checkEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const events = await Event.find({ isDeleted: false });
    console.log('Total Events:', events.length);
    events.forEach(e => {
        console.log(`- ${e.title} (${e.status}) [${e.startDate.toDateString()} - ${e.endDate.toDateString()}]`);
    });

    const upcoming = await Event.countDocuments({ status: 'UPCOMING', isDeleted: false });
    console.log('Upcoming Events:', upcoming);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkEvents();
