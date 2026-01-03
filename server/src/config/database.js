import mongoose from "mongoose"

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/credit-risk-analysis"

    await mongoose.connect(mongoUri)

    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close()
  console.log("MongoDB connection closed")
  process.exit(0)
})
