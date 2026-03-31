'use client';

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { generateDecryptionStrategy, type DecryptionStrategyOutput } from "@/ai/flows/threat-analysis-assistant"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  ShieldCheck, 
  Loader2, 
  Unlock, 
  Terminal, 
  Key, 
  FileCheck, 
  History,
  AlertCircle,
  Undo2
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useFirestore, useUser } from "@/firebase"
import { doc } from "firebase/firestore"
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates"

interface LogEntry {
  text: string;
  time: string;
}

export default function MitigationHubPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()

  const [loading, setLoading] = React.useState(false)
  const [strategy, setStrategy] = React.useState<DecryptionStrategyOutput | null>(null)
  const [mitigating, setMitigating] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [log, setLog] = React.useState<LogEntry[]>([])
  const [completed, setCompleted] = React.useState(false)

  const threatType = searchParams.get('threatType') || "Unknown Ransomware"
  const fileName = searchParams.get('filePath') || "encrypted_file.crypt"
  const reportId = searchParams.get('reportId')

  const fetchStrategy = async () => {
    setLoading(true)
    try {
      const output = await generateDecryptionStrategy({
        threatType,
        sampleFileName: fileName
      })
      setStrategy(output)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (threatType) fetchStrategy()
  }, [threatType])

  const addLogEntry = (text: string) => {
    setLog(prev => [...prev, { text, time: new Date().toLocaleTimeString() }])
  }

  const startMitigation = async () => {
    if (!strategy) return
    setMitigating(true)
    setLog([
      { text: "Initializing secure decryption environment...", time: new Date().toLocaleTimeString() },
      { text: "Detecting encryption entropy patterns...", time: new Date().toLocaleTimeString() }
    ])
    
    if (db && user && reportId) {
      const reportRef = doc(db, 'users', user.uid, 'scanReports', reportId)
      updateDocumentNonBlocking(reportRef, { mitigationStatus: "Mitigating" })
    }

    const steps = [
      `Validating decryption key: ${strategy.decryptionKeySimulated}`,
      "Decrypting Master File Table (MFT) records...",
      "Removing malicious file headers...",
      "Restoring original file extensions...",
      "Executing system cleanup scripts...",
      "Verifying data integrity..."
    ]

    let currentStep = 0
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        const next = prev + 1
        if (next % 15 === 0 && currentStep < steps.length) {
          const stepText = steps[currentStep]
          if (stepText) {
            addLogEntry(stepText)
          }
          currentStep++
        }
        if (next === 100) {
          finalizeMitigation()
        }
        return next
      })
    }, 50)
  }

  const finalizeMitigation = () => {
    setMitigating(false)
    setCompleted(true)
    addLogEntry("SUCCESS: All files decrypted and system hardened.")
    
    if (db && user && reportId) {
      const reportRef = doc(db, 'users', user.uid, 'scanReports', reportId)
      updateDocumentNonBlocking(reportRef, { 
        mitigationStatus: "Resolved",
        status: "Mitigated & Clean"
      })
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-5xl space-y-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <Unlock className="h-8 w-8 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-headline">Recovery Hub</h1>
            <p className="text-muted-foreground text-lg">AI-powered file decryption and threat remediation console.</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.back()} className="border-border/40">
          <Undo2 className="mr-2 h-4 w-4" /> Back to Analysis
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Strategy Section */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-card border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Decryption Strategy</CardTitle>
                  <CardDescription>Generated for: {threatType}</CardDescription>
                </div>
                {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!strategy && !loading ? (
                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                  Awaiting threat identification...
                </div>
              ) : strategy ? (
                <>
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 flex items-center gap-4">
                    <Key className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold text-primary">Master Recovery Key</p>
                      <p className="font-mono text-lg select-all">{strategy.decryptionKeySimulated}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-accent" />
                      Recovery Protocol
                    </h4>
                    <ol className="list-decimal list-outside ml-5 space-y-3">
                      {strategy.recoverySteps.map((step, i) => (
                        <li key={i} className="text-sm text-muted-foreground leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cleanup Script</h4>
                    <div className="p-4 bg-muted/30 rounded-lg font-mono text-xs text-emerald-400 border border-border/40 whitespace-pre-wrap">
                      {strategy.cleanupScript}
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Execution Section */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-card border-emerald-500/20 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20" />
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Execution Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {mitigating ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold">{progress}%</span>
                    <span className="text-xs text-emerald-500 font-bold uppercase animate-pulse">Processing...</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-muted" />
                </div>
              ) : completed ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-500">Decryption Successful</h4>
                    <p className="text-xs text-muted-foreground">Threat mitigated and files restored to original state.</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">Ready to initiate automated mitigation and decryption protocol.</p>
                  <Button 
                    onClick={startMitigation}
                    disabled={!strategy || mitigating}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold h-12"
                  >
                    INITIATE RECOVERY
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Log Output</p>
                <div className="h-[200px] overflow-y-auto bg-black/40 p-3 rounded border border-border/40 font-mono text-[10px] space-y-1">
                  {log.map((entry, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-muted-foreground/40 shrink-0">[{entry.time}]</span>
                      <span className={entry.text?.startsWith('SUCCESS') ? 'text-emerald-400' : 'text-foreground/80'}>
                        {entry.text}
                      </span>
                    </div>
                  ))}
                  {mitigating && <div className="animate-pulse text-emerald-400">_</div>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            variant="outline" 
            className="w-full border-border/40"
            onClick={() => router.push('/history')}
          >
            <History className="mr-2 h-4 w-4" /> View Resolution History
          </Button>
        </div>
      </div>
    </div>
  )
}
