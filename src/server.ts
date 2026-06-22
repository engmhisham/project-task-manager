import app from './app';
import { config } from './config';
import { connectDatabase } from './config/database';

const start = async () => {
  await connectDatabase();

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`API Docs: http://localhost:${config.port}/api-docs`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
