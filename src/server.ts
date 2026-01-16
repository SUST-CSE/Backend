import app from './app';
import { env } from './config/env';
import { connectDB } from './config/database';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start Express Server
    const server = app.listen(env.PORT, () => {
      console.log(`
      🚀 Server is running!
      📡 Port: ${env.PORT}
      🌍 Environment: ${env.NODE_ENV}
      🔗 URL: http://localhost:${env.PORT}
      `);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err: any) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err: any) => {
      console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      process.exit(1);
    });

    // Handle SIGTERM signal
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
      server.close(() => {
        console.log('💥 Process terminated!');
      });
    });

  } catch (error) {
    console.error(`❌ Fatal error starting server: ${error}`);
    process.exit(1);
  }
};

startServer();
