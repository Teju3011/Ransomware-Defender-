
'use client';

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Shield, RefreshCw, Loader2 } from "lucide-react"
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"

export default function SettingsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid, 'settings', 'current');
  }, [db, user]);

  const { data: settings, isLoading } = useDoc(settingsRef);

  const updateSetting = (key: string, value: any) => {
    if (!settingsRef) return;
    const newSettings = {
      ...(settings || {
        id: 'current',
        activeProtectionEnabled: true,
        automaticUpdatesEnabled: true,
        scanFrequencySetting: 'weekly',
        language: 'en',
        notifyOnThreatDetection: true,
        stopProcessOnDetection: false
      }),
      [key]: value
    };
    setDocumentNonBlocking(settingsRef, newSettings, { merge: true });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentSettings = settings || {
    activeProtectionEnabled: true,
    automaticUpdatesEnabled: true,
    scanFrequencySetting: 'weekly',
    language: 'en',
    stopProcessOnDetection: false
  };

  return (
    <div className="container mx-auto p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold tracking-tight font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your protection preferences and application behavior.</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-card border-border/40">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Security & Protection</CardTitle>
            </div>
            <CardDescription>Configure the core behavior of Ransomware Defender.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Active Protection</Label>
                <p className="text-sm text-muted-foreground">Monitor file system in real-time for suspicious patterns.</p>
              </div>
              <Switch 
                checked={currentSettings.activeProtectionEnabled} 
                onCheckedChange={(v) => updateSetting('activeProtectionEnabled', v)} 
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Stop Suspicious Processes</Label>
                <p className="text-sm text-muted-foreground">Automatically kill processes identified as ransomware.</p>
              </div>
              <Switch 
                checked={currentSettings.stopProcessOnDetection} 
                onCheckedChange={(v) => updateSetting('stopProcessOnDetection', v)} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40">
          <CardHeader>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-accent" />
              <CardTitle>System & Updates</CardTitle>
            </div>
            <CardDescription>Manage how the application updates and communicates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-2">
              <Label>Scan Frequency</Label>
              <Select 
                value={currentSettings.scanFrequencySetting}
                onValueChange={(v) => updateSetting('scanFrequencySetting', v)}
              >
                <SelectTrigger className="w-full bg-background border-border/40">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily (High Risk)</SelectItem>
                  <SelectItem value="weekly">Weekly (Recommended)</SelectItem>
                  <SelectItem value="monthly">Monthly (Low Impact)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
             <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Automatic Updates</Label>
                <p className="text-sm text-muted-foreground">Keep security engines up-to-date automatically.</p>
              </div>
              <Switch 
                checked={currentSettings.automaticUpdatesEnabled} 
                onCheckedChange={(v) => updateSetting('automaticUpdatesEnabled', v)} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
