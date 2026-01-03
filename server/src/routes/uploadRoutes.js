import express from "express"
import { uploadFile } from "../controllers/uploadController.js"
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js"

const router = express.Router()

router.post("/", uploadMiddleware, uploadFile)

export default router
