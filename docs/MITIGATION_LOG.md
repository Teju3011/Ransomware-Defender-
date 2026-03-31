# Security and Technical Mitigation Report

This document details the exact resolutions for errors identified during the development of the Ransomware Defender application.

## 1. Hydration Mismatch Mitigation
**Error:** `Runtime Error: Hydration failed because the initial UI does not match what was rendered on the server.`
**Root Cause:** Browser extensions were injecting DOM attributes into the `<body>` tag before React hydration completed.
**Correction:** Applied `suppressHydrationWarning` to the `<html>` tag in `src/app/layout.tsx`.

## 2. Permission Denied Mitigation (Scan Reports & Privacy)
**Error:** `FirebaseError: Missing or insufficient permissions` on path `/users/{uid}/scanReports` during `list` operations.
**Root Cause:** The rules engine was attempting to evaluate an external `isAdmin()` existence check during a collection-level list query, which often fails if not statically provable for all items.
**Correction:** 
- **File:** `firestore.rules`
- **Action:** Refactored user data rules to use a recursive wildcard `match /users/{userId}/{allPaths=**}` and separated the `isOwner` and `isAdmin` checks into two distinct `allow` statements. This ensures the owner's fast, static UID check is evaluated first and independently of the expensive admin lookup.

## 3. Duplicate Report Mitigation
**Error:** Scan reports were appearing twice in the security history.
**Root Cause:** The `setInterval` logic was triggering the completion write multiple times before the interval was cleared.
**Correction:** Introduced `scanInProgressRef` and explicit `clearInterval` guards in `src/components/dashboard/scan-control.tsx` and `src/app/scan/custom/page.tsx`.

## 4. Malware Detection Heuristics
**Requirement:** Real ransomware files were not being flagged.
**Correction:** Implemented extension-based signature checks (`.crypt`, `.wannacry`, etc.) in the scanning engine to correctly identify and flag malicious files.

## 5. Sequential AI Recommendations
**Error:** AI mitigation steps were appearing out of order.
**Correction:** Updated the Genkit flow to return recommendations as a `z.array(z.string())` and used an HTML `<ol>` for rendering in `src/app/analysis/page.tsx`.

## 6. Privacy Status Permission Mitigation
**Error:** `FirebaseError: Missing or insufficient permissions` on path `/users/{uid}/privacyStatus/latest`.
**Root Cause:** Explicit rules were missing for the privacy status collection.
**Correction:** Included `privacyStatus` under the new recursive user data security rule.

## 7. Mitigation Log Rendering Error
**Error:** `TypeError: Cannot read properties of undefined (reading 'startsWith')` in `src/app/mitigation/page.tsx`.
**Root Cause:** The component was attempting to call `.startsWith()` on a log entry that was temporarily `undefined` due to a race condition in the state update or improper array mapping.
**Correction:** 
- **File:** `src/app/mitigation/page.tsx`
- **Action:** Refactored the `log` state to use a structured `LogEntry` object (including `text` and `time`). Added optional chaining and existence checks (`entry.text?.startsWith`) to the render loop. Moved timestamp generation to the event creation phase to prevent hydration shifts.
