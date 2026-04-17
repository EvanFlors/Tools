import mongoose from "mongoose";
import env from "./env.js";

const MAX_RETRIES = 10;
const BASE_DELAY_MS = 2000; // 2 seconds, doubles each attempt (max ~17 min)

const connectDB = async () => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(env.mongoUri);
      console.log("MongoDB connected");
      return;
    } catch (error) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.error(
        `MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`
      );
      if (attempt === MAX_RETRIES) {
        console.error("All MongoDB connection attempts exhausted. Exiting.");
        process.exit(1);
      }
      console.log(`Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export default connectDB;
