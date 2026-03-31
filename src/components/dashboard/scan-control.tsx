'use client';

import * as React from "react"
import { Shield, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useFirestore, useUser } from "@/firebase"
import { doc } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"

export function ScanControl() {
  const [isScanning, setIsScanning] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [foundThreat, setFoundThreat] = React.useState(false)
  const { user } = useUser()
  const db = useFirestore()
  const scanInProgressRef = React.useRef(false)

  const handleScan = () => {
    if (isScanning || scanInProgressRef.current) return
    
    setIsScanning(true)
    scanInProgressRef.current = true
    setProgress(0)
    setFoundThreat(false)
    
    const startTime = new Date().toISOString()
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        
        const next = prev + 1
        
        if (next === 100) {
          clearInterval(interval)
          setIsScanning(false)
          scanInProgressRef.current = false
          
          const isThreatFound = Math.random() < 0.1;
          setFoundThreat(isThreatFound);

          if (db && user) {
            const reportId = crypto.randomUUID();
            const reportRef = doc(db, 'users', user.uid, 'scanReports', reportId);
            setDocumentNonBlocking(reportRef, {
              id: reportId,
              scanType: "Full System",
              startTime: startTime,
              endTime: new Date().toISOString(),
              status: isThreatFound ? "Threat Found" : "Clean",
              totalFilesScanned: Math.floor(Math.random() * 500000) + 1000000,
              totalThreatsDetected: isThreatFound ? Math.floor(Math.random() * 5) + 1 : 0,
              durationSeconds: 5
            }, { merge: true })
          }
        }
        return next
      })
    }, 50)
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      <div className="relative group">
        <div className={cn(
          "absolute inset-0 rounded-full transition-all duration-700",
          isScanning ? "animate-pulse scale-110 opacity-60 bg-primary/20 blur-2xl" : "opacity-0 group-hover:opacity-40 bg-primary/20 blur-2xl",
          foundThreat && !isScanning && "bg-destructive/30 opacity-100 blur-3xl"
        )} />
        
        <svg className="h-64 w-64 -rotate-90 transform">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-secondary"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
            className={cn(
              "transition-all duration-300 ease-out",
              foundThreat && progress === 100 ? "text-destructive" : "text-primary"
            )}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-4 flex items-center justify-center">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className={cn(
              "h-56 w-56 rounded-full bg-card border-4 flex flex-col items-center justify-center space-y-2 transition-all duration-300",
              "hover:scale-105 active:scale-95 disabled:hover:scale-100",
              "scan-button-glow",
              isScanning ? "border-primary cursor-default" : "border-primary/30 hover:border-primary",
              foundThreat && !isScanning && "border-destructive/50 hover:border-destructive"
            )}
          >
            {isScanning ? (
              <>
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <span className="text-2xl font-bold text-foreground">{progress}%</span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Scanning...</span>
              </>
            ) : foundThreat ? (
              <>
                <AlertTriangle className="h-20 w-20 text-destructive" />
                <span className="text-3xl font-bold text-foreground tracking-tight">ALERT</span>
                <span className="text-xs font-medium text-destructive uppercase tracking-widest">Threat Found</span>
              </>
            ) : (
              <>
                <Shield className="h-20 w-20 text-primary" />
                <span className="text-3xl font-bold text-foreground tracking-tight">SCAN</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Full Protection</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className={cn(
            "rounded-full px-6 border-primary/20 hover:bg-primary/10 text-primary font-semibold",
            foundThreat && "border-destructive/50 text-destructive hover:bg-destructive/10"
          )}
          onClick={() => {
            if (foundThreat) window.location.href = '/analysis';
            else handleScan();
          }}
        >
          {foundThreat ? "View Threat Analysis" : "Check Updates"}
        </Button>
      </div>
    </div>
  )
}
