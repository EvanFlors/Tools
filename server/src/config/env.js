import dotenv from 'dotenv';

dotenv.config();

const env = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV || "development"
};

export default env;