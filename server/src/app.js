import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import uploadRoutes from "./routes/uploadRoutes.js"
import analysisRoutes from "./routes/analysisRoutes.js"
import { errorHandler } from "./middlewares/errorHandler.js"

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Logging
app.use(morgan("dev"))

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Credit Risk API",
  })
})

// Routes
app.use("/api/uploads", uploadRoutes)
app.use("/api/analyses", analysisRoutes)

// Error handling (must be last)
app.use(errorHandler)

export default app
