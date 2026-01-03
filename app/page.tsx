import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Upload, History, Shield } from "lucide-react"

export default function HomePage() {
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
            <Link href="/" className="text-sm font-medium text-foreground">
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 text-balance">Credit Risk Analysis Platform</h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Upload your customer data and leverage machine learning to predict default risk with precision. Get
            comprehensive insights through interactive visualizations and model comparisons.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/upload">
                <Upload className="mr-2 h-5 w-5" />
                Upload Dataset
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/history">
                <History className="mr-2 h-5 w-5" />
                View History
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Upload</h3>
              <p className="text-sm text-muted-foreground">
                Simply upload your Excel file and let our system handle the rest. Supports .xlsx and .csv formats.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">ML Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Multiple machine learning models analyze your data including Random Forest, XGBoost, and more.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Risk Insights</h3>
              <p className="text-sm text-muted-foreground">
                Get detailed risk categorization, feature importance, and model performance metrics.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
