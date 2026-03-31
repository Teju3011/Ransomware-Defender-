
'use client';

import * as React from "react";
import { 
  Clock, 
  Loader2, 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown,
  CalendarDays,
  History,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useUser, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const DAYS_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ScheduledScanPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const scheduleRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid, 'scheduledScans', 'default');
  }, [db, user]);

  const { data: schedule, isLoading: isScheduleLoading } = useDoc(scheduleRef);

  // Simplified query to avoid composite index requirement (where + orderBy)
  const reportsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'scanReports'),
      orderBy('startTime', 'desc'),
      limit(20)
    );
  }, [db, user]);

  const { data: allReports, isLoading: isHistoryLoading } = useCollection(reportsQuery);

  const pastScans = React.useMemo(() => {
    if (!allReports) return [];
    return allReports
      .filter(r => r.scanType === 'Automated Scheduled Scan')
      .slice(0, 5);
  }, [allReports]);

  const [hours, setHours] = React.useState("10");
  const [minutes, setMinutes] = React.useState("00");
  const [period, setPeriod] = React.useState("AM");
  const [selectedDays, setSelectedDays] = React.useState<string[]>(["Monday", "Friday"]);
  const [isSaving, setIsSaving] = React.useState(false);

  // Sync state with Firestore data when loaded
  React.useEffect(() => {
    if (schedule) {
      setHours(schedule.hours || "10");
      setMinutes(schedule.minutes || "00");
      setPeriod(schedule.period || "AM");
      setSelectedDays(schedule.days || []);
    }
  }, [schedule]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const selectAll = () => setSelectedDays([...DAYS]);
  const clearAll = () => setSelectedDays([]);

  const adjustTime = (type: 'hours' | 'minutes', direction: 'up' | 'down') => {
    if (type === 'hours') {
      let h = parseInt(hours);
      h = direction === 'up' ? (h % 12) + 1 : (h - 2 + 12) % 12 + 1;
      setHours(h.toString().padStart(2, '0'));
    } else {
      let m = parseInt(minutes);
      m = direction === 'up' ? (m + 5) % 60 : (m - 5 + 60) % 60;
      setMinutes(m.toString().padStart(2, '0'));
    }
  };

  const calculateNextScan = React.useMemo(() => {
    if (!mounted || selectedDays.length === 0) return null;

    const now = new Date();
    const currentDayIdx = now.getDay();
    
    let schedHour = parseInt(hours);
    if (period === "PM" && schedHour !== 12) schedHour += 12;
    if (period === "AM" && schedHour === 12) schedHour = 0;
    const schedMin = parseInt(minutes);

    for (let i = 0; i < 7; i++) {
      const dayIdx = (currentDayIdx + i) % 7;
      const dayName = DAYS_ORDER[dayIdx];
      
      if (selectedDays.includes(dayName)) {
        const potentialDate = new Date(now);
        potentialDate.setDate(now.getDate() + i);
        potentialDate.setHours(schedHour, schedMin, 0, 0);

        if (potentialDate > now) {
          return potentialDate;
        }
      }
    }
    return null;
  }, [mounted, hours, minutes, period, selectedDays]);

  const handleApply = () => {
    if (!db || !user || !scheduleRef) return;
    
    setIsSaving(true);
    const newSchedule = {
      id: 'default',
      hours,
      minutes,
      period,
      days: selectedDays,
      updatedAt: new Date().toISOString()
    };

    setDocumentNonBlocking(scheduleRef, newSchedule, { merge: true });
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Schedule Updated",
        description: `Next scan scheduled for ${calculateNextScan?.toLocaleString() || "selected days"}.`,
      });
    }, 500);
  };

  if (isScheduleLoading) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Synchronizing schedules...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl space-y-12 pb-32">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Defense Scheduler</h1>
        <p className="text-muted-foreground">Automate deep system audits to maintain your security perimeter.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-5 w-5" />
                <CardTitle className="text-lg uppercase tracking-wider">Audit Time</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6 space-y-8">
              <div className="flex items-center gap-4 text-5xl md:text-6xl font-light">
                <div className="flex flex-col items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => adjustTime('hours', 'up')} className="text-muted-foreground hover:text-primary"><ChevronUp /></Button>
                  <div className="h-24 w-24 rounded-full border-2 border-border flex items-center justify-center bg-card shadow-inner font-mono">{hours}</div>
                  <Button variant="ghost" size="icon" onClick={() => adjustTime('hours', 'down')} className="text-muted-foreground hover:text-primary"><ChevronDown /></Button>
                </div>
                <span className="mb-8 text-muted-foreground/30">:</span>
                <div className="flex flex-col items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => adjustTime('minutes', 'up')} className="text-muted-foreground hover:text-primary"><ChevronUp /></Button>
                  <div className="h-24 w-24 rounded-full border-2 border-border flex items-center justify-center bg-card shadow-inner font-mono">{minutes}</div>
                  <Button variant="ghost" size="icon" onClick={() => adjustTime('minutes', 'down')} className="text-muted-foreground hover:text-primary"><ChevronDown /></Button>
                </div>
                <div className="flex flex-col items-center pt-10">
                  <button onClick={() => setPeriod(p => p === "AM" ? "PM" : "AM")} className="h-24 w-24 rounded-full border-2 border-border flex items-center justify-center bg-card hover:border-primary/50 text-2xl transition-all active:scale-95">{period}</button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/40 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2 text-primary">
                <CalendarDays className="h-5 w-5" />
                <CardTitle className="text-lg uppercase tracking-wider">Audit Frequency</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs">All</Button>
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs">None</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {DAYS.map((day) => (
                  <div key={day} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <Checkbox 
                      id={day} 
                      checked={selectedDays.includes(day)}
                      onCheckedChange={() => toggleDay(day)}
                      className="h-5 w-5 border-2 data-[state=checked]:bg-primary"
                    />
                    <label htmlFor={day} className={cn("text-sm font-medium cursor-pointer", selectedDays.includes(day) ? "text-foreground" : "text-muted-foreground")}>{day}</label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-primary/5 border-primary/20 border-l-4 border-l-primary shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary">
                <Zap className="h-5 w-5" />
                <CardTitle className="text-base uppercase tracking-wider">Scan Outlook</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-background/50 border border-border/20">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Next Scheduled Audit</p>
                {mounted && calculateNextScan ? (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{calculateNextScan.toLocaleDateString()}</p>
                      <p className="text-sm text-emerald-500 font-medium">{calculateNextScan.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ) : !mounted ? (
                  <div className="mt-2 h-10 w-full animate-pulse bg-muted/20 rounded-lg" />
                ) : (
                  <p className="mt-2 text-sm text-destructive font-medium">No days selected. System unprotected.</p>
                )}
              </div>
              
              <div className="p-4 rounded-xl bg-background/50 border border-border/20">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Protection Pulse</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{selectedDays.length} Days Active</p>
                    <p className="text-xs text-muted-foreground">Automatic ransomware signature updates active.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/40 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <History className="h-5 w-5" />
                <CardTitle className="text-base uppercase tracking-wider">Audit Trail</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isHistoryLoading ? (
                <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : pastScans.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No automated scans recorded yet.</div>
              ) : (
                <div className="divide-y divide-border/20">
                  {pastScans.map((scan) => (
                    <div key={scan.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-mono font-bold text-primary">{scan.id.substring(0, 8)}</p>
                          <Badge variant={scan.status === "Clean" ? "outline" : "destructive"} className="text-[10px] h-4 px-1">
                            {scan.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(scan.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-foreground">{scan.totalFilesScanned?.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Files</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 md:p-8 md:pl-72 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none z-50">
        <div className="max-w-4xl mx-auto flex justify-center pointer-events-auto">
          <Button 
            onClick={handleApply}
            disabled={isSaving || selectedDays.length === 0}
            className="w-full max-w-md h-14 text-lg font-bold bg-[#00D1B2] hover:bg-[#00BFA5] text-white shadow-2xl shadow-[#00D1B2]/30 transition-all active:scale-95"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
            {isSaving ? "SYNCING..." : "APPLY PROTECTION PLAN"}
          </Button>
        </div>
      </div>
    </div>
  );
}
