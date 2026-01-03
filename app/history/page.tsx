"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, FileSpreadsheet, ArrowRight, Calendar, Loader2, AlertCircle } from "lucide-react"
import { getAllAnalyses, type Analysis } from "@/lib/api"

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAllAnalyses({ limit: 50 })
      setAnalyses(response.data)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analyses")
      setLoading(false)
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
            <Link href="/upload" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Upload
            </Link>
            <Link href="/history" className="text-sm font-medium text-foreground">
              History
            </Link>
          </nav>
        </div>
      </header>

      {/* History Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Analysis History</h2>
          <p className="text-muted-foreground">View and access your previous credit risk analyses</p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading analyses...</p>
          </div>
        )}

        {error && (
          <Card className="border-destructive/50">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load analyses</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadAnalyses}>Try Again</Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <Card key={analysis._id} className="border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileSpreadsheet className="h-6 w-6 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg truncate">{analysis.filename}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              analysis.status === "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : analysis.status === "failed"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {analysis.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(analysis.createdAt).toLocaleString()}</span>
                          </div>
                          {analysis.results?.dataset.rows && (
                            <>
                              <span>•</span>
                              <span>{analysis.results.dataset.rows.toLocaleString()} rows</span>
                            </>
                          )}
                        </div>
                        {analysis.results?.bestModel && (
                          <div className="mt-2 flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Best Model:</span>{" "}
                              <span className="font-medium">{analysis.results.bestModel.name}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Accuracy:</span>{" "}
                              <span className="font-medium text-green-600">
                                {(analysis.results.bestModel.testAcc * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button asChild disabled={analysis.status !== "completed"}>
                      <Link href={`/analysis/${analysis._id}`}>
                        View Report
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {analyses.length === 0 && (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
                  <p className="text-muted-foreground mb-6">Upload your first dataset to get started</p>
                  <Button asChild>
                    <Link href="/upload">Upload Dataset</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
