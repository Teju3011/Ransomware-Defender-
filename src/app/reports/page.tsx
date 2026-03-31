
'use client';

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Search, Filter, Loader2, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"

export default function ReportsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const reportsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'scanReports'), orderBy('startTime', 'desc'));
  }, [db, user]);

  const { data: reports, isLoading } = useCollection(reportsQuery);

  const stats = React.useMemo(() => {
    if (!reports) return { total: 0, threats: 0, safe: 0 };
    return reports.reduce((acc, curr) => ({
      total: acc.total + 1,
      threats: acc.threats + (curr.totalThreatsDetected > 0 ? 1 : 0),
      safe: acc.safe + (curr.totalThreatsDetected === 0 ? 1 : 0)
    }), { total: 0, threats: 0, safe: 0 });
  }, [reports]);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-headline">Scan Reports</h1>
          <p className="text-muted-foreground text-lg">Historical audit trail of all scan activities.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10 w-[240px] bg-card" placeholder="Search reports..." />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="py-4">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Total Scans</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </CardHeader>
        </Card>
        <Card className="bg-card">
          <CardHeader className="py-4">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Threats Found</div>
            <div className="text-2xl font-bold mt-1 text-destructive">{stats.threats}</div>
          </CardHeader>
        </Card>
        <Card className="bg-card">
          <CardHeader className="py-4">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Safe Scans</div>
            <div className="text-2xl font-bold mt-1 text-emerald-500">{stats.safe}</div>
          </CardHeader>
        </Card>
        <Card className="bg-card">
          <CardHeader className="py-4">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">System Health</div>
            <div className="text-2xl font-bold mt-1 text-primary">100%</div>
          </CardHeader>
        </Card>
      </div>

      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Fetching reports...</p>
          </div>
        ) : !reports || reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground/20" />
            <p className="text-muted-foreground">No reports available yet. Run a scan from the dashboard.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Scan Date</TableHead>
                <TableHead>Scan Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Files Scanned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} className="cursor-pointer hover:bg-muted/30">
                  <TableCell className="font-mono font-bold text-primary">{report.id.substring(0, 8)}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(report.startTime).toLocaleString()}
                  </TableCell>
                  <TableCell>{report.scanType}</TableCell>
                  <TableCell>
                    <Badge variant={report.totalThreatsDetected === 0 ? "secondary" : "destructive"}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{report.durationSeconds}s</TableCell>
                  <TableCell>{report.totalFilesScanned.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
