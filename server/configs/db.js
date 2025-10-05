import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("Database connected"));
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "caravan-stories",
    });
  } catch (error) {
    console.log("MongoDB error:", error.message);
  }
};

export default connectDB;