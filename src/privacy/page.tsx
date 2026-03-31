
'use client';

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  FileWarning, 
  UserCheck, 
  ChevronRight,
  Fingerprint,
  Info,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"

const MONITOR_CONFIG = [
  {
    id: "exfiltration",
    title: "Data Exfiltration Protection",
    description: "Monitoring outbound traffic for patterns typical of ransomware 'leak-ware' behavior.",
    impact: "High",
    icon: EyeOff,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    id: "shadow_copy",
    title: "Shadow Copy Integrity",
    description: "Verifying that Volume Shadow Copies are protected from unauthorized deletion.",
    impact: "Critical",
    icon: Lock,
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    id: "credential_guard",
    title: "Credential Guard",
    description: "Isolation of stored system credentials to prevent lateral movement during an attack.",
    impact: "Medium",
    icon: Fingerprint,
    color: "text-accent",
    bg: "bg-accent/10"
  },
  {
    id: "permissions",
    title: "Sensitive File Permissions",
    description: "Detected 3 shared folders with 'Everyone' read/write access. High risk of encryption.",
    impact: "Critical",
    icon: FileWarning,
    color: "text-destructive",
    bg: "bg-destructive/10"
  }
]

export default function PrivacyAdvisorPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [isScanning, setIsScanning] = React.useState(false)

  const statusRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid, 'privacyStatus', 'latest');
  }, [db, user]);

  const { data: privacyData, isLoading } = useDoc(statusRef);

  const score = privacyData?.score || 0;
  const monitorResults = privacyData?.monitorResults || {
    exfiltration: "Inactive",
    shadow_copy: "Unknown",
    credential_guard: "Inactive",
    permissions: "Check Required"
  };

  const handleRunAudit = () => {
    if (!db || !user || !statusRef) return;
    
    setIsScanning(true)
    
    // Simulate complex privacy audit
    setTimeout(() => {
      const newScore = 80 + Math.floor(Math.random() * 15);
      const newStatus = {
        id: 'latest',
        score: newScore,
        lastAudit: new Date().toISOString(),
        monitorResults: {
          exfiltration: "Active",
          shadow_copy: "Secured",
          credential_guard: "Active",
          permissions: Math.random() > 0.5 ? "Action Required" : "Healthy"
        }
      };
      
      setDocumentNonBlocking(statusRef, newStatus, { merge: true });
      setIsScanning(false)
    }, 2000)
  }

  return (
    <div className="container mx-auto p-8 max-w-5xl space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent/20 rounded-xl">
            <ShieldCheck className="h-8 w-8 text-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-headline">Privacy Advisor</h1>
            <p className="text-muted-foreground text-lg">Mitigate data exposure and prevent unauthorized exfiltration.</p>
          </div>
        </div>
        <Button 
          onClick={handleRunAudit}
          disabled={isScanning || isLoading}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-12 px-8"
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              AUDITING...
            </>
          ) : "RUN PRIVACY AUDIT"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Score Overview */}
        <Card className="lg:col-span-4 bg-card border-border/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <UserCheck className="h-24 w-24 text-accent/5 -mr-8 -mt-8" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg uppercase tracking-widest text-muted-foreground">Privacy Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-6">
            <div className="relative h-48 w-48 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted/20"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - score / 100)}
                  className="text-accent transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold">{score}</span>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                  {score > 80 ? "Safe" : score > 0 ? "Warning" : "N/A"}
                </span>
              </div>
            </div>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-accent">{score > 0 ? "Analyzed" : "Pending Audit"}</span>
              </div>
              <Progress value={score} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Detailed Checks */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Active Privacy Monitors</h3>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            MONITOR_CONFIG.map((monitor) => {
              const status = monitorResults[monitor.id as keyof typeof monitorResults] || "Unknown";
              const isAlert = status === "Action Required" || status === "Unknown" || status === "Check Required";
              
              return (
                <Card key={monitor.id} className="bg-card/50 border-border/40 hover:border-accent/30 transition-all group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn("p-3 rounded-lg shrink-0", isAlert ? "bg-destructive/10" : monitor.bg)}>
                      <monitor.icon className={cn("h-6 w-6", isAlert ? "text-destructive" : monitor.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground">{monitor.title}</h4>
                        <Badge variant="outline" className={cn("text-[10px] uppercase h-4 px-1.5", 
                          isAlert ? "border-destructive text-destructive" : "border-emerald-500/50 text-emerald-500"
                        )}>
                          {status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{monitor.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Impact</span>
                      <Badge variant="secondary" className="text-[10px]">{monitor.impact}</Badge>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              );
            })
          )}
          
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex gap-4 items-start">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              The Privacy Advisor continuously monitors for <strong>Double Extortion</strong> tactics. Ensuring your privacy score remains above 80 is critical for total system defense. Audit data is stored securely in your user profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
