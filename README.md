# Ransomware Defender

Advanced heuristic-based defense and AI-powered threat analysis for the modern endpoint.

## 🚀 Core Features

### 🛡️ Real-Time Dashboard
- **Live Metrics**: Tracks total files scanned, threats detected, and system uptime.
- **Manual Scan Engine**: High-fidelity UI for triggering instant system-wide heuristic audits.

### 🔍 Advanced Scanning Modules
- **Custom File Scan**: Selective analysis of specific directories or files for ransomware signatures.
- **Defense Scheduler**: Full calendar-based automation for recurring security audits with "Next Scan" prediction.
- **Heuristic Detection**: Identification of malicious patterns, entropy shifts, and ransomware extensions (.crypt, .wannacry, etc.).

### 🤖 AI Threat Intelligence (Genkit + Gemini 2.5)
- **Automated Analysis**: Interprets complex system logs to provide human-readable threat assessments.
- **Recovery Hub**: Generates AI-powered decryption strategies, master recovery keys, and technical recovery protocols.
- **Cleanup Scripts**: AI-driven generation of shell/powershell scripts for malicious trace removal.

### 🔒 Privacy Advisor
- **Exfiltration Monitor**: Tracks patterns typical of "leak-ware" or double-extortion tactics.
- **Integrity Checks**: Monitors Shadow Copy status and sensitive folder permissions.
- **Privacy Score**: A dynamic 0-100 security posture rating backed by Firestore-stored audits.

### 📜 Security History & Audit Trail
- **Persistent Logs**: Every detection and mitigation event is recorded in Firebase Firestore.
- **Resolution Tracking**: Manage the lifecycle of a threat from "Pending" to "Resolved."

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Firebase Firestore (Real-time data streaming)
- **AI Engine**: Genkit + Google Gemini 2.5 Flash
- **Authentication**: Firebase Anonymous Auth (Data isolation per endpoint)
- **Styling**: Tailwind CSS + ShadCN UI
- **Icons**: Lucide React

## 📂 Project Documentation
- [Project Architecture](./docs/PROJECT_ARCHITECTURE.md): Overview of the system logic and data flow.
- [Mitigation Log](./docs/MITIGATION_LOG.md): Record of technical fixes and security hardening.
- [Research Directions](./docs/RESEARCH_DIRECTIONS.md): Future work and academic enhancement opportunities.

---
*Ransomware Defender is designed for research and demonstration of AI-integrated endpoint security.*
