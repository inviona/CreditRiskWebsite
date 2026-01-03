import app from "./app.js"
import { connectDB } from "./config/database.js"

const PORT = process.env.PORT || 3001

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB()

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
