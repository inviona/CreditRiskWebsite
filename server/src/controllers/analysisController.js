import Analysis from "../models/Analysis.js"

export const getAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params

    const analysis = await Analysis.findById(id)

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      })
    }

    res.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllAnalyses = async (req, res, next) => {
  try {
    const { limit = 20, skip = 0, status } = req.query

    const query = status ? { status } : {}

    const analyses = await Analysis.find(query)
      .select("filename fileSize status results.bestModel createdAt")
      .sort({ createdAt: -1 })
      .limit(Number.parseInt(limit))
      .skip(Number.parseInt(skip))

    const total = await Analysis.countDocuments(query)

    res.json({
      success: true,
      data: analyses,
      pagination: {
        total,
        limit: Number.parseInt(limit),
        skip: Number.parseInt(skip),
      },
    })
  } catch (error) {
    next(error)
  }
}

export const deleteAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params

    const analysis = await Analysis.findByIdAndDelete(id)

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      })
    }

    // Optionally delete the file from disk
    // fs.unlinkSync(analysis.filePath);

    res.json({
      success: true,
      message: "Analysis deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}
