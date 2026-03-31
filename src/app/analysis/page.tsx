
"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { threatAnalysisAssistant, type ThreatAnalysisOutput } from "@/ai/flows/threat-analysis-assistant"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, BrainCircuit, Loader2, ShieldAlert, CheckCircle2, Unlock } from "lucide-react"

export default function AnalysisPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<ThreatAnalysisOutput | null>(null)
  
  const [formData, setFormData] = React.useState({
    filePath: "C:\\Users\\Admin\\Documents\\Sensitive_Data",
    threatType: "Mass File Renaming (.crypt)",
    details: "Detected 45 file changes within 2 seconds. Unusual entropy increase in file headers."
  })

  const reportId = searchParams.get('reportId')

  // Sync with search parameters on mount
  React.useEffect(() => {
    const filePath = searchParams.get('filePath')
    const threatType = searchParams.get('threatType')
    const details = searchParams.get('details')

    if (filePath || threatType || details) {
      setFormData({
        filePath: filePath || "",
        threatType: threatType || "",
        details: details || ""
      })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const output = await threatAnalysisAssistant({
        ...formData,
        timeDetected: new Date().toISOString()
      })
      setResult(output)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleMitigate = () => {
    const params = new URLSearchParams({
      threatType: formData.threatType,
      filePath: formData.filePath,
    })
    if (reportId) params.set('reportId', reportId)
    router.push(`/mitigation?${params.toString()}`)
  }

  return (
    <div className="container mx-auto p-8 max-w-5xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-xl">
            <BrainCircuit className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-headline">AI Threat Analysis</h1>
            <p className="text-muted-foreground">Leverage generative AI to interpret complex ransomware behaviors.</p>
          </div>
        </div>
        {result && (
          <Button onClick={handleMitigate} className="bg-emerald-500 hover:bg-emerald-600 font-bold">
            <Unlock className="mr-2 h-4 w-4" /> DECIPHER & MITIGATE
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <Card className="lg:col-span-5 bg-card border-border/40 h-fit">
          <CardHeader>
            <CardTitle>Reported Event Details</CardTitle>
            <CardDescription>Input detection data for instant AI analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">File Path / Scope</label>
                <Input 
                  value={formData.filePath}
                  onChange={e => setFormData(p => ({ ...p, filePath: e.target.value }))}
                  placeholder="e.g., C:\System32\Drivers" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Threat Category</label>
                <Input 
                  value={formData.threatType}
                  onChange={e => setFormData(p => ({ ...p, threatType: e.target.value }))}
                  placeholder="e.g., Suspicious Extension Change" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Detection Logs / Context</label>
                <Textarea 
                  value={formData.details}
                  onChange={e => setFormData(p => ({ ...p, details: e.target.value }))}
                  className="min-h-[120px]"
                  placeholder="Provide any additional details..." 
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-bold h-12" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                RUN ANALYSIS
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/40 rounded-xl bg-muted/20">
              <ShieldAlert className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-medium text-muted-foreground">Awaiting Input</h3>
              <p className="text-sm text-muted-foreground max-w-xs mt-2">Fill the form to generate a comprehensive AI threat assessment report.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-primary/20 rounded-xl bg-primary/5">
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <h3 className="text-xl font-medium text-primary">Analyzing Event...</h3>
              <p className="text-sm text-muted-foreground max-w-xs mt-2">Consulting security models and cross-referencing ransomware patterns.</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="bg-card border-primary/20 shadow-xl border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                    <CardTitle className="text-lg">Assessment Summary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">
                    {result.analysis}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-accent/20 shadow-xl border-l-4 border-l-accent">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-accent">
                    <AlertCircle className="h-5 w-5" />
                    <CardTitle className="text-lg">Recommended Mitigation Steps</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-outside ml-5 space-y-4">
                    {result.recommendations.map((step, index) => (
                      <li key={index} className="text-foreground font-medium pl-2 leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
              
              <div className="pt-4">
                <Button onClick={handleMitigate} className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-lg font-bold shadow-xl shadow-emerald-500/20">
                  <Unlock className="mr-2 h-5 w-5" /> START AUTOMATED RECOVERY
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
