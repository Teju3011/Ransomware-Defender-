'use client';

import * as React from 'react';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

const DAYS_ARRAY = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

/**
 * Background monitor that checks for scheduled scans every 30 seconds.
 * This is the logic that 'runs' the scan at the appointed time.
 */
export function ScheduledScanMonitor() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  // Track the last triggered slot to prevent duplicates in the same minute.
  // We use a Ref to persist across re-renders without triggering new effects.
  const lastTriggeredRef = React.useRef<string | null>(null);
  // Store the pending timeout ID for cleanup
  const pendingScanTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const scheduleRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid, 'scheduledScans', 'default');
  }, [db, user]);

  const { data: schedule } = useDoc(scheduleRef);

  React.useEffect(() => {
    if (!schedule || !db || !user) return;

    const checkSchedule = () => {
      const now = new Date();
      // Deterministic day lookup
      const currentDay = DAYS_ARRAY[now.getDay()];
      
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = hours.toString().padStart(2, '0');
      const minutesStr = now.getMinutes().toString().padStart(2, '0');

      // Create a unique key for this specific DATE and time slot.
      // Including toDateString ensures that the same time on a DIFFERENT week triggers correctly.
      const currentSlotKey = `${now.toDateString()}-${hoursStr}:${minutesStr}-${ampm}`;

      const isScheduledDay = schedule.days?.includes(currentDay);
      const isScheduledTime = 
        schedule.hours === hoursStr && 
        schedule.minutes === minutesStr && 
        schedule.period === ampm;

      // If scheduled time matches now, and we haven't run it yet this specific day/time
      if (isScheduledDay && isScheduledTime && lastTriggeredRef.current !== currentSlotKey) {
        lastTriggeredRef.current = currentSlotKey;
        
        toast({
          title: "Scheduled Scan Started",
          description: `System is performing its scheduled security audit for ${currentDay}...`,
        });

        // Simulate a slight delay for the "work" to happen.
        // We track this in a Ref so we can clear it if the component unmounts.
        pendingScanTimeoutRef.current = setTimeout(() => {
          triggerAutomatedScan();
        }, 5000);
      }
    };

    /**
     * Logic for the automated scan triggered by the scheduler.
     */
    const triggerAutomatedScan = () => {
      if (!db || !user) return;

      const reportId = crypto.randomUUID();
      const reportRef = doc(db, 'users', user.uid, 'scanReports', reportId);
      const startTime = new Date().toISOString();
      
      // Heuristic simulation: 5% chance of finding a mock threat during background scan
      const isThreatFound = Math.random() < 0.05;
      const threatsDetected = isThreatFound ? Math.floor(Math.random() * 3) + 1 : 0;

      const newReport = {
        id: reportId,
        scanType: "Automated Scheduled Scan",
        startTime: startTime,
        endTime: new Date().toISOString(),
        status: isThreatFound ? "Threat Found" : "Clean",
        totalFilesScanned: Math.floor(Math.random() * 800000) + 1200000,
        totalThreatsDetected: threatsDetected,
        durationSeconds: 15
      };

      setDocumentNonBlocking(reportRef, newReport, { merge: true });

      if (isThreatFound) {
        toast({
          variant: "destructive",
          title: "SECURITY ALERT",
          description: `Scheduled scan detected ${threatsDetected} suspicious patterns! Visit the Threat Analysis page immediately.`,
        });
      } else {
        toast({
          title: "Scheduled Scan Completed",
          description: "Automated audit finished successfully. No threats detected.",
        });
      }
    };

    // Check every 30 seconds to ensure we don't miss the minute window
    const interval = setInterval(checkSchedule, 30000);
    checkSchedule();

    return () => {
      clearInterval(interval);
      if (pendingScanTimeoutRef.current) {
        clearTimeout(pendingScanTimeoutRef.current);
      }
    };
  }, [schedule, db, user, toast]);

  return null;
}
