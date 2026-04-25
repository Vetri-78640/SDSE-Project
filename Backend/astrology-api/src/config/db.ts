import mongoose from "mongoose";
import { logger } from "../utils/logger";

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;


  if (!mongoUri) {
;
    throw new Error("MONGO_URI is not set");
  }

  await mongoose.connect(mongoUri);
  logger.info("MongoDB connected");
};
