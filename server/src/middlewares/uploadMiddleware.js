import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [".xlsx", ".csv"]
  const ext = path.extname(file.originalname).toLowerCase()

  if (allowedTypes.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error("Invalid file type. Only .xlsx and .csv files are allowed."))
  }
}

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
})

export const uploadMiddleware = upload.single("file")
