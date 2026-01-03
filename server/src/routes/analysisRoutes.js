import express from "express"
import { getAnalysis, getAllAnalyses, deleteAnalysis } from "../controllers/analysisController.js"

const router = express.Router()

router.get("/", getAllAnalyses)
router.get("/:id", getAnalysis)
router.delete("/:id", deleteAnalysis)

export default router
