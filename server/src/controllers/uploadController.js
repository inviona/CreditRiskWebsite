import Analysis from "../models/Analysis.js"
import { analyzeWithPython } from "../services/analysisService.js"

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      })
    }

    // Create analysis record
    const analysis = new Analysis({
      filename: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      status: "queued",
    })

    await analysis.save()

    // Start analysis asynchronously
    processAnalysis(analysis._id, req.file.path)

    res.status(202).json({
      success: true,
      message: "File uploaded successfully. Analysis started.",
      analysisId: analysis._id,
      status: "queued",
    })
  } catch (error) {
    next(error)
  }
}

// Async processing function
async function processAnalysis(analysisId, filePath) {
  try {
    // Update status
    await Analysis.findByIdAndUpdate(analysisId, {
      status: "processing",
    })

    const startTime = Date.now()

    // Call Python service
    const results = await analyzeWithPython(filePath)

    const processingTime = Date.now() - startTime

    // Update with results
    await Analysis.findByIdAndUpdate(analysisId, {
      status: "completed",
      results: results,
      "metadata.processingTime": processingTime,
    })

    console.log(`Analysis ${analysisId} completed in ${processingTime}ms`)
  } catch (error) {
    console.error(`Analysis ${analysisId} failed:`, error)

    // Update with error
    await Analysis.findByIdAndUpdate(analysisId, {
      status: "failed",
      error: {
        message: error.message,
        details: error.stack,
      },
    })
  }
}
