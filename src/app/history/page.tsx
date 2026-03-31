'use client';

import * as React from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  History, 
  Trash2, 
  Loader2, 
  Search, 
  Filter, 
  AlertCircle,
  Clock,
  FileSearch,
  CheckCircle2,
  Shield,
  Unlock
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useCollection, useFirestore, useUser, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase"
import { collection, query, orderBy, doc } from "firebase/firestore"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function HistoryPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'scanReports'), orderBy('startTime', 'desc'));
  }, [db, user]);

  const { data: reports, isLoading } = useCollection(historyQuery);

  const handleDelete = (reportId: string) => {
    if (!db || !user) return;
    const reportRef = doc(db, 'users', user.uid, 'scanReports', reportId);
    deleteDocumentNonBlocking(reportRef);
  };

  const filteredReports = reports?.filter(report => 
    report.scanType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.id.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleMitigate = (report: any) => {
    const params = new URLSearchParams({
      threatType: report.scanType,
      reportId: report.id
    })
    router.push(`/mitigation?${params.toString()}`)
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent/20 rounded-xl">
            <History className="h-8 w-8 text-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-headline">Security History</h1>
            <p className="text-muted-foreground text-lg">Detailed audit trail of all previous detection events and mitigation status.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-10 w-[300px] bg-card border-border/40 focus:ring-accent/30" 
              placeholder="Search by ID, type, or status..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="border-border/40">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card/40 border border-border/40 p-6 rounded-xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Total Audits</p>
            <p className="text-2xl font-bold">{reports?.length || 0}</p>
          </div>
        </div>
        <div className="bg-card/40 border border-border/40 p-6 rounded-xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Resolved Threats</p>
            <p className="text-2xl font-bold">
              {reports?.filter(r => r.mitigationStatus === 'Resolved' && r.totalThreatsDetected > 0).length || 0}
            </p>
          </div>
        </div>
        <div className="bg-card/40 border border-border/40 p-6 rounded-xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Pending Response</p>
            <p className="text-2xl font-bold text-destructive">
              {reports?.filter(r => r.mitigationStatus === 'Pending' || r.mitigationStatus === 'Mitigating').length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-2xl backdrop-blur-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Retrieving encrypted audit logs...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
            <div className="h-24 w-24 rounded-full bg-muted/20 flex items-center justify-center border-2 border-dashed border-border/60">
              <FileSearch className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-medium text-foreground">No History Found</h3>
              <p className="text-muted-foreground max-w-sm">
                {searchQuery 
                  ? "No scans match your current filter criteria." 
                  : "Start a system scan to begin building your security trail."}
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px]">Event ID</TableHead>
                <TableHead>Activity / Target</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Mitigation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id} className="hover:bg-muted/30 transition-colors group">
                  <TableCell className="font-mono text-[10px] font-bold text-primary">
                    {report.id.substring(0, 12)}...
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {report.scanType}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(report.startTime).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={report.totalThreatsDetected === 0 ? "outline" : "destructive"}
                      className={report.totalThreatsDetected === 0 ? "border-emerald-500/50 text-emerald-500" : ""}
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {report.totalThreatsDetected > 0 ? (
                      <Badge 
                        variant={report.mitigationStatus === 'Resolved' ? 'secondary' : 'default'}
                        className={cn(
                          "cursor-pointer",
                          report.mitigationStatus === 'Pending' && "bg-orange-500 hover:bg-orange-600 animate-pulse",
                          report.mitigationStatus === 'Mitigating' && "bg-blue-500"
                        )}
                        onClick={() => report.mitigationStatus !== 'Resolved' && handleMitigate(report)}
                      >
                        {report.mitigationStatus || 'Pending'}
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {report.mitigationStatus !== 'Resolved' && report.totalThreatsDetected > 0 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10"
                          onClick={() => handleMitigate(report)}
                          title="Mitigate Now"
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-border/40">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Security Log?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will permanently remove the record for scan <strong>{report.id.substring(0, 8)}</strong> from your security history.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-background border-border/40">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(report.id)}
                              className="bg-destructive hover:bg-destructive/90 text-white"
                            >
                              Delete Record
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
