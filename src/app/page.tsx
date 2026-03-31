
'use client';

import { ScanControl } from "@/components/dashboard/scan-control"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Activity, AlertTriangle, Cpu, Globe, Server, Loader2 } from "lucide-react"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, limit, orderBy } from "firebase/firestore"

export default function Dashboard() {
  const { user } = useUser()
  const db = useFirestore()

  const reportsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'scanReports'), orderBy('startTime', 'desc'), limit(5));
  }, [db, user]);

  const { data: reports, isLoading } = useCollection(reportsQuery);

  const stats = {
    scanned: reports?.reduce((acc, r) => acc + (r.totalFilesScanned || 0), 0) || 0,
    threats: reports?.reduce((acc, r) => acc + (r.totalThreatsDetected || 0), 0) || 0,
  }

  return (
    <div className="container mx-auto p-8 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Real-time ransomware monitoring and system protection.</p>
        </div>
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-500 font-bold uppercase tracking-widest text-xs">System Protected</span>
        </div>
      </div>

      <div className="flex justify-center">
        <ScanControl />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-primary/10 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Files Scanned
            </CardTitle>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(stats.scanned / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground mt-1">Aggregated across all reports</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-primary/10 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Detected Threats
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.threats}</div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed ransomware patterns blocked</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-primary/10 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              System Uptime
            </CardTitle>
            <Cpu className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground mt-1">Continuous behavior monitoring</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card border-border/40">
          <CardHeader>
            <CardTitle className="text-xl">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Local Defense Engine", status: "Healthy", icon: Server, color: "text-emerald-500" },
              { label: "Behavior Monitor", status: "Active", icon: ShieldCheck, color: "text-primary" },
              { label: "AI Threat Cloud", status: "Connected", icon: Globe, color: "text-accent" },
            ].map((node, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/20">
                <div className="flex items-center gap-3">
                  <node.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{node.label}</span>
                </div>
                <span className={node.color}>{node.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border/40">
          <CardHeader>
            <CardTitle className="text-xl">Recent Scan History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : !reports || reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent scans recorded.</p>
            ) : (
              reports.map((log) => (
                <div key={log.id} className="flex flex-col border-b border-border/40 pb-2 last:border-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{log.scanType} complete: {log.status}</span>
                    <span className="text-xs text-muted-foreground">{new Date(log.startTime).toLocaleTimeString()}</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {log.totalFilesScanned.toLocaleString()} files processed
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
