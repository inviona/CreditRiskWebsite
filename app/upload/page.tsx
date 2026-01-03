"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Shield, Loader2, FileSpreadsheet, X, AlertCircle } from "lucide-react"
import { uploadFile } from "@/lib/api"

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile)
        setError(null)
      } else {
        setError("Invalid file type. Please upload .xlsx or .csv files only.")
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const { analysisId } = await uploadFile(file)
      router.push(`/analysis/${analysisId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">RiskAnalyzer</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/upload" className="text-sm font-medium text-foreground">
              Upload
            </Link>
            <Link href="/history" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              History
            </Link>
          </nav>
        </div>
      </header>

      {/* Upload Section */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Upload Dataset</CardTitle>
            <CardDescription>
              Upload an Excel or CSV file containing customer data for credit risk analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {!file ? (
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive ? "border-primary bg-primary/5" : "border-border"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-1">Drop your file here</p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                  </div>
                  <input
                    type="file"
                    id="file-upload"
                    accept=".xlsx,.csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Browse Files
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground">Supports .xlsx and .csv files</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)} disabled={uploading}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Button onClick={handleUpload} disabled={uploading} className="w-full" size="lg">
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading & Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Start Analysis
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Expected Format</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Customer data with demographic information</p>
              <p>• Financial metrics (income, debt, credit score)</p>
              <p>• Loan details and payment history</p>
              <p>• Risk_of_default column (0-1 scale)</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">What We Analyze</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Risk distribution and categorization</p>
              <p>• 7+ machine learning models</p>
              <p>• Feature importance analysis</p>
              <p>• Model performance metrics</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
