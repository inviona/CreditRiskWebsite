// API client for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export interface AnalysisResponse {
  success: boolean
  data?: Analysis
  message?: string
}

export interface AnalysesListResponse {
  success: boolean
  data: Analysis[]
  pagination: {
    total: number
    limit: number
    skip: number
  }
}

export interface Analysis {
  _id: string
  filename: string
  fileSize: number
  status: "queued" | "processing" | "completed" | "failed"
  results?: AnalysisResults
  error?: {
    message: string
    details?: string
  }
  createdAt: string
  updatedAt: string
}

export interface AnalysisResults {
  dataset: {
    rows: number
    cols: number
    missingCount: number
    missingByColumn?: Record<string, number>
  }
  target: {
    riskDistribution: RiskCategory[]
    riskCategoryCounts: Record<string, number>
  }
  models: ModelResult[]
  bestModel: BestModelResult
  featureImportance: FeatureImportance[]
  charts: ChartData
  notes: string[]
}

export interface RiskCategory {
  category: string
  count: number
  percentage: number
}

export interface ModelResult {
  name: string
  trainAcc: number
  testAcc: number
  cvMean: number
  cvStd: number
  rocAuc?: number
  confusionMatrix?: number[][]
}

export interface BestModelResult extends ModelResult {
  confusionMatrix: number[][]
}

export interface FeatureImportance {
  feature: string
  importance: number
}

export interface ChartData {
  riskHistogram: { bin: string; count: number }[]
  riskCategoryBar: RiskCategory[]
  modelAccuracyBar: {
    name: string
    trainAcc: number
    testAcc: number
    cvMean: number
  }[]
  featureImportanceTop15: FeatureImportance[]
}

// Upload file
export async function uploadFile(file: File): Promise<{ analysisId: string; status: string }> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Upload failed")
  }

  const data = await response.json()
  return {
    analysisId: data.analysisId,
    status: data.status,
  }
}

// Get single analysis
export async function getAnalysis(id: string): Promise<Analysis> {
  const response = await fetch(`${API_BASE_URL}/analyses/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to fetch analysis")
  }

  const data = await response.json()
  return data.data
}

// Get all analyses
export async function getAllAnalyses(params?: {
  limit?: number
  skip?: number
  status?: string
}): Promise<AnalysesListResponse> {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append("limit", params.limit.toString())
  if (params?.skip) queryParams.append("skip", params.skip.toString())
  if (params?.status) queryParams.append("status", params.status)

  const response = await fetch(`${API_BASE_URL}/analyses?${queryParams}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to fetch analyses")
  }

  return response.json()
}

// Delete analysis
export async function deleteAnalysis(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/analyses/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to delete analysis")
  }
}

// Poll for analysis completion
export async function pollAnalysis(
  id: string,
  onUpdate?: (analysis: Analysis) => void,
  maxAttempts = 60,
): Promise<Analysis> {
  let attempts = 0

  while (attempts < maxAttempts) {
    const analysis = await getAnalysis(id)

    if (onUpdate) {
      onUpdate(analysis)
    }

    if (analysis.status === "completed" || analysis.status === "failed") {
      return analysis
    }

    // Wait 2 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 2000))
    attempts++
  }

  throw new Error("Analysis timed out")
}
