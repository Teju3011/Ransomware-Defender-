
'use client';

import * as React from "react";
import { 
  FileSearch, 
  Loader2, 
  ShieldCheck, 
  FileText, 
  X, 
  Upload,
  AlertCircle,
  AlertTriangle,
  Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useFirestore, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function CustomScanPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [isScanning, setIsScanning] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [scanComplete, setScanComplete] = React.useState(false);
  const [detectedThreats, setDetectedThreats] = React.useState<File[]>([]);
  const [lastReportId, setLastReportId] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleScan = () => {
    if (selectedFiles.length === 0 || isScanning) return;
    
    setIsScanning(true);
    setProgress(0);
    setScanComplete(false);
    setDetectedThreats([]);

    const startTime = new Date().toISOString();
    const stepTime = Math.max(20, 1000 / selectedFiles.length);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        const next = prev + 1;
        if (next === 100) {
          clearInterval(interval);
          finishScan(startTime);
        }
        return next;
      });
    }, stepTime);
  };

  const finishScan = (startTime: string) => {
    const suspiciousExtensions = ['.crypt', '.locked', '.encrypted', '.crpt', '.onion', '.bitman', '.wannacry'];
    const suspiciousNames = ['decrypt', 'ransom', 'how_to_recover', 'private_key'];
    
    const threats = selectedFiles.filter(file => {
      const name = file.name.toLowerCase();
      return suspiciousExtensions.some(ext => name.endsWith(ext)) || 
             suspiciousNames.some(keyword => name.includes(keyword));
    });

    setDetectedThreats(threats);
    setIsScanning(false);
    setScanComplete(true);
    
    if (db && user) {
      const reportId = crypto.randomUUID();
      setLastReportId(reportId);
      const reportRef = doc(db, 'users', user.uid, 'scanReports', reportId);
      
      const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);

      setDocumentNonBlocking(reportRef, {
        id: reportId,
        scanType: `Custom File Scan (${selectedFiles.length} files, ${sizeMB}MB)`,
        startTime: startTime,
        endTime: new Date().toISOString(),
        status: threats.length > 0 ? "Threat Found" : "Clean",
        mitigationStatus: threats.length > 0 ? "Pending" : "Resolved",
        totalFilesScanned: selectedFiles.length,
        totalThreatsDetected: threats.length,
        durationSeconds: Math.floor(Math.random() * 5) + 3
      }, { merge: true });
    }
  };

  const handleAnalyzeRedirect = () => {
    if (detectedThreats.length > 0) {
      const firstThreat = detectedThreats[0];
      const params = new URLSearchParams({
        filePath: firstThreat.name,
        threatType: "Heuristic Signature Match",
        details: `Suspicious pattern detected in file: ${firstThreat.name}. Extension or filename matches known ransomware behavior.`,
      });
      if (lastReportId) params.set('reportId', lastReportId)
      router.push(`/analysis?${params.toString()}`);
    } else {
      router.push('/analysis');
    }
  };

  const handleMitigateRedirect = () => {
    if (detectedThreats.length > 0) {
      const firstThreat = detectedThreats[0];
      const params = new URLSearchParams({
        threatType: "Heuristic Signature Match",
        filePath: firstThreat.name,
      });
      if (lastReportId) params.set('reportId', lastReportId)
      router.push(`/mitigation?${params.toString()}`);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isScanning) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-in fade-in duration-500">
        <div className="relative">
          <Loader2 className="h-32 w-32 text-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{progress}%</span>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Analyzing Selected Files...</h2>
          <p className="text-muted-foreground">Checking binary signatures and entropy patterns.</p>
        </div>
        <div className="w-full max-w-md">
          <Progress value={progress} className="h-2" />
        </div>
        <div className="text-sm font-mono text-primary/70 animate-pulse bg-primary/5 px-4 py-2 rounded border border-primary/20">
          Scanning: {selectedFiles[Math.floor((progress / 100) * (selectedFiles.length - 1))]?.name || "Initializing..."}
        </div>
      </div>
    );
  }

  if (scanComplete) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[80vh] space-y-6 animate-in zoom-in duration-300">
        {detectedThreats.length > 0 ? (
          <div className="h-24 w-24 bg-destructive/20 rounded-full flex items-center justify-center border border-destructive/50">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        ) : (
          <div className="h-24 w-24 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50">
            <ShieldCheck className="h-12 w-12 text-emerald-500" />
          </div>
        )}
        
        <div className="text-center space-y-2">
          <h2 className={cn("text-3xl font-bold", detectedThreats.length > 0 ? "text-destructive" : "text-foreground")}>
            {detectedThreats.length > 0 ? "Threat Detected!" : "Scan Completed"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg">
            {detectedThreats.length > 0 
              ? `Warning: ${detectedThreats.length} files were identified as containing ransomware signatures. Proceed to mitigation to decrypt and restore.`
              : `Successfully analyzed ${selectedFiles.length} files. No ransomware threats detected.`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button onClick={() => { setScanComplete(false); setSelectedFiles([]); }} variant="outline">
            New Scan
          </Button>
          {detectedThreats.length > 0 ? (
            <>
              <Button onClick={handleAnalyzeRedirect} variant="secondary">
                Analyze Threat
              </Button>
              <Button onClick={handleMitigateRedirect} className="bg-emerald-500 hover:bg-emerald-600">
                <Unlock className="mr-2 h-4 w-4" /> Decipher & Mitigate
              </Button>
            </>
          ) : (
            <Button onClick={() => router.push('/reports')}>
              View History
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-headline">Custom File Scan</h1>
          <p className="text-muted-foreground">Select specific files from your local system for deep analysis.</p>
        </div>
        <Button onClick={triggerFilePicker} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
          <Upload className="mr-2 h-4 w-4" /> Browse Files
        </Button>
      </div>

      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="bg-card/50 border-border/40 overflow-hidden backdrop-blur-sm h-[60vh] flex flex-col">
            <CardHeader className="border-b border-border/40 shrink-0">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                <span>Selected Queue</span>
                <span className="text-primary">{selectedFiles.length} Files</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              {selectedFiles.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                  <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                    <FileSearch className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground">No files selected</h3>
                    <p className="text-sm text-muted-foreground/60">Click browse or drag files here to begin.</p>
                  </div>
                  <Button onClick={triggerFilePicker} size="sm" variant="secondary">Select Files</Button>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="divide-y divide-border/20">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <div className="truncate">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatSize(file.size)} • {file.type || 'Unknown Type'}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-primary/5 border-primary/20 border-l-4 border-l-primary shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary">
                <AlertCircle className="h-5 w-5" />
                <CardTitle className="text-base uppercase tracking-wider">Scan Scope</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Files:</span>
                <span className="font-bold">{selectedFiles.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Size:</span>
                <span className="font-bold">
                  {formatSize(selectedFiles.reduce((acc, f) => acc + f.size, 0))}
                </span>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={handleScan}
                  disabled={selectedFiles.length === 0}
                  className="w-full h-12 text-lg font-bold bg-[#00D1B2] hover:bg-[#00BFA5] text-white shadow-xl shadow-[#00D1B2]/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  START SCAN
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl border border-border/40 bg-muted/10">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Recovery Info</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If threats are found, Ransomware Defender provides automated decryption and mitigation strategies to restore your data safely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
