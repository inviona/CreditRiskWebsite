import FormData from "form-data"
import fs from "fs"
import fetch from "node-fetch"

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000"

export const analyzeWithPython = async (filePath) => {
  try {
    // Create form data
    const formData = new FormData()
    formData.append("file", fs.createReadStream(filePath))

    // Call Python service
    const response = await fetch(`${PYTHON_SERVICE_URL}/analyze`, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Python service analysis failed")
    }

    const results = await response.json()
    return results
  } catch (error) {
    console.error("Python service error:", error)
    throw error
  }
}
