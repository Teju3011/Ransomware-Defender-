# Ransomware Defender: Project Architecture

This document provides a high-level pseudo-code representation of the application's core logic and structure for presentation purposes.

## 1. Authentication & Security Gateway
The application ensures every user is isolated.
```pseudo
Function InitializeApplication():
    // Ensure Firebase is ready
    Firebase.Initialize()
    
    // Auth Gate: Ensure user identity
    If User session is empty:
        Sign-In Anonymously() // Assigns a unique UID for data isolation
    End If
    
    Render ApplicationShell()
```

## 2. Real-Time Security Dashboard
Data is streamed live from Firestore to ensure the UI is always up-to-date.
```pseudo
Component Dashboard():
    User = GetAuthenticatedUser()
    // Real-time subscription to the last 5 reports
    RecentReports = Firestore.Subscribe("users/{User.uid}/scanReports", limit: 5, sort: "desc")
    
    // Calculate live aggregates
    TotalFiles = RecentReports.Sum(r => r.totalFilesScanned)
    ThreatsFound = RecentReports.Sum(r => r.totalThreatsDetected)
    
    Display Metrics(TotalFiles, ThreatsFound)
    Display HistoryTable(RecentReports)
```

## 3. Background Scanning Engine
The engine handles both manual and scheduled operations.
```pseudo
Function ExecuteScan(type, files):
    Log "Starting {type} scan..."
    
    Report = {
        id: GenerateUUID(),
        scanType: type,
        startTime: CurrentTimestamp(),
        status: "Scanning",
        totalFilesScanned: files.count
    }
    
    For each ProgressStep from 1 to 100:
        Update UI(ProgressStep)
        If ProgressStep == 100:
            Report.status = "Clean"
            Report.endTime = CurrentTimestamp()
            // Persist to database
            Firestore.Save("users/{User.uid}/scanReports/{Report.id}", Report)
            NotifyUser("System Protected: No threats found")
```

## 4. Automated Scheduler (The Monitor)
A background process that stays in sync with user preferences.
```pseudo
Component ScheduledScanMonitor():
    Schedule = Firestore.Subscribe("users/{User.uid}/scheduledScans/default")
    
    Loop Every 30 Seconds:
        CurrentTime = GetSystemTime()
        If CurrentTime.Day matches Schedule.Days AND CurrentTime.HH:MM matches Schedule.Time:
            If TaskNotAlreadyExecutedThisMinute:
                ExecuteScan(type: "Automated Scheduled Scan")
                MarkMinuteAsCompleted()
```

## 5. AI Threat Analysis (Genkit & Gemini)
Leveraging Generative AI to interpret suspicious behavior.
```pseudo
ServerFunction AI_Analyze_Threat(logData):
    // Define the AI Agent
    Model = Genkit.Load("gemini-2.0-flash")
    
    Prompt = "Analyze these file system logs for ransomware patterns: {logData}. 
              Provide a summary and actionable mitigation steps."
    
    Result = Model.Generate(Prompt)
    
    Return {
        analysis: Result.Text,
        steps: Result.Recommendations
    }
```

## 6. Privacy Advisor Logic
Heuristic evaluation of system privacy risks.
```pseudo
Component PrivacyAdvisor():
    Checks = [
        "Data Exfiltration",
        "Shadow Copy Status",
        "Credential Guard",
        "Permission Audit"
    ]
    
    PrivacyScore = CalculateRisk(Checks)
    Render SecurityPostures(Checks, PrivacyScore)
```

## 7. Firestore Security Policy (Rules)
Enforcing strict data ownership at the database level.
```rules
// Pseudo-Security Rules
Match /users/{userId}/{document=**}:
    Allow Read/Write: If Request.Auth.UID == userId
    // No one else can see or touch this user's security data.
```
