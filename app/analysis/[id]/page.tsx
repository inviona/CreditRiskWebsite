"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Download, ArrowLeft, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts"
import { getAnalysis, pollAnalysis, type Analysis } from "@/lib/api"

const RISK_COLORS = ["#10b981", "#f59e0b", "#ef4444"]

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalysis()
  }, [id])

  const loadAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getAnalysis(id)
      setAnalysis(data)

      if (data.status === "queued" || data.status === "processing") {
        await pollAnalysis(id, (updatedAnalysis) => {
          setAnalysis(updatedAnalysis)
        })
      }

      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analysis")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">RiskAnalyzer</h1>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">
            {analysis?.status === "processing" ? "Analyzing Dataset..." : "Loading Analysis..."}
          </h2>
          <p className="text-muted-foreground">
            {analysis?.status === "processing"
              ? "Training ML models and generating insights. This may take 10-30 seconds."
              : "Please wait while we fetch your analysis results."}
          </p>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">RiskAnalyzer</h1>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-20 text-center max-w-2xl">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
          <p className="text-muted-foreground mb-6">{error || "Analysis not found"}</p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/history">Back to History</Link>
            </Button>
            <Button onClick={loadAnalysis}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const data = analysis.results

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">RiskAnalyzer</h1>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">No analysis results available yet.</p>
        </div>
      </div>
    )
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
            <Link href="/history" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              History
            </Link>
          </nav>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/history">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to History
            </Link>
          </Button>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Analysis Report</h2>
            <p className="text-sm text-muted-foreground">
              {analysis.filename} • Analysis ID: {id}
            </p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rows</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.dataset.rows.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Columns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.dataset.cols}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Missing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.dataset.missingCount}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Best Model</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold truncate">{data.bestModel.name}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Test Acc</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{(data.bestModel.testAcc * 100).toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ROC-AUC</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.bestModel.rocAuc?.toFixed(3) || "N/A"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Risk Distribution */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.target.riskDistribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.percentage.toFixed(1)}%`}
                  >
                    {data.target.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RISK_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Model Comparison */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Model Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.charts.modelAccuracyBar}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="testAcc" name="Test Accuracy" fill="#3b82f6" />
                  <Bar dataKey="cvMean" name="CV Mean" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Feature Importance */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Top Feature Importance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.featureImportance.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="feature" width={150} fontSize={12} />
                <Tooltip />
                <Bar dataKey="importance" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
