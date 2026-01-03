import mongoose from "mongoose"

const analysisSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
    },
    results: {
      dataset: {
        rows: Number,
        cols: Number,
        missingCount: Number,
        missingByColumn: mongoose.Schema.Types.Mixed,
      },
      target: {
        riskDistribution: [mongoose.Schema.Types.Mixed],
        riskCategoryCounts: mongoose.Schema.Types.Mixed,
      },
      models: [mongoose.Schema.Types.Mixed],
      bestModel: {
        name: String,
        trainAcc: Number,
        testAcc: Number,
        cvMean: Number,
        cvStd: Number,
        rocAuc: Number,
        confusionMatrix: [[Number]],
      },
      featureImportance: [mongoose.Schema.Types.Mixed],
      charts: mongoose.Schema.Types.Mixed,
      notes: [String],
    },
    metadata: {
      analysisVersion: String,
      processingTime: Number,
    },
    error: {
      message: String,
      details: String,
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries
analysisSchema.index({ createdAt: -1 })
analysisSchema.index({ status: 1 })

export default mongoose.model("Analysis", analysisSchema)
