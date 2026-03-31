
'use client';

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Zap, 
  BrainCircuit, 
  Clock, 
  Lock, 
  ShieldCheck, 
  Server, 
  Globe,
  Cpu,
  Fingerprint
} from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto p-8 max-w-5xl space-y-12 pb-24">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <div className="inline-flex p-4 bg-primary/20 rounded-2xl mb-4 border border-primary/30 shadow-2xl shadow-primary/10">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight font-headline">Ransomware Defender</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Advanced heuristic-based defense and AI-powered threat analysis for the modern endpoint.
        </p>
      </div>

      {/* Mission Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            In an era of increasingly sophisticated cyber attacks, traditional signature-based detection is no longer enough. Ransomware Defender was built to bridge the gap between static analysis and intelligent behavior monitoring.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            By combining real-time file system auditing with Generative AI, we empower security administrators to not just detect threats, but to understand and mitigate them before they can cause catastrophic data loss.
          </p>
          <div className="flex gap-4 pt-4">
            <Badge variant="secondary" className="px-3 py-1">Enterprise Ready</Badge>
            <Badge variant="secondary" className="px-3 py-1">AI-Powered</Badge>
            <Badge variant="secondary" className="px-3 py-1">Privacy Focused</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card/50 border-border/40 p-6 flex flex-col items-center text-center space-y-2">
            <Cpu className="h-8 w-8 text-accent" />
            <h3 className="font-bold">Heuristics</h3>
            <p className="text-xs text-muted-foreground">Pattern-based detection engine</p>
          </Card>
          <Card className="bg-card/50 border-border/40 p-6 flex flex-col items-center text-center space-y-2">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <h3 className="font-bold">GenAI</h3>
            <p className="text-xs text-muted-foreground">Gemini 2.5 threat analysis</p>
          </Card>
          <Card className="bg-card/50 border-border/40 p-6 flex flex-col items-center text-center space-y-2">
            <Server className="h-8 w-8 text-emerald-500" />
            <h3 className="font-bold">Firestore</h3>
            <p className="text-xs text-muted-foreground">Real-time data persistence</p>
          </Card>
          <Card className="bg-card/50 border-border/40 p-6 flex flex-col items-center text-center space-y-2">
            <Globe className="h-8 w-8 text-orange-500" />
            <h3 className="font-bold">Cloud</h3>
            <p className="text-xs text-muted-foreground">Distributed defense network</p>
          </Card>
        </div>
      </div>

      {/* Core Features */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Core Defense Pillars</h2>
          <p className="text-muted-foreground mt-2">Integrated modules working in harmony to protect your data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border/40 hover:border-primary/30 transition-colors">
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle>AI Threat Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Utilizes Genkit and Google Gemini to interpret complex system logs, identifying high-entropy file changes characteristic of ransomware encryption.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/40 hover:border-accent/30 transition-colors">
            <CardHeader>
              <ShieldCheck className="h-8 w-8 text-accent mb-2" />
              <CardTitle>Privacy Advisor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monitors for data exfiltration patterns and "leak-ware" behavior, ensuring that your sensitive information remains secure and unexposed.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/40 hover:border-emerald-500/30 transition-colors">
            <CardHeader>
              <Clock className="h-8 w-8 text-emerald-500 mb-2" />
              <CardTitle>Scheduled Audits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automated background scanning engine that runs silent system checks at user-defined intervals, providing continuous protection without intervention.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tech Stack */}
      <Card className="bg-muted/30 border-dashed border-border/60">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-muted-foreground" />
            <h3 className="text-xl font-bold">The Technology Stack</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Framework</p>
              <p className="text-foreground">Next.js 15 (App Router)</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Database</p>
              <p className="text-foreground">Firebase Firestore</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">AI Engine</p>
              <p className="text-foreground">Genkit + Gemini 2.5</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">UI Library</p>
              <p className="text-foreground">ShadCN + Tailwind CSS</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Quote */}
      <div className="text-center pt-8 border-t border-border/40">
        <div className="flex justify-center mb-4">
          <Fingerprint className="h-10 w-10 text-muted-foreground/20" />
        </div>
        <p className="text-muted-foreground italic max-w-lg mx-auto">
          "Security is not a product, but a process. Ransomware Defender is the intelligence driving that process."
        </p>
      </div>
    </div>
  )
}
