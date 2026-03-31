
"use client"

import * as React from "react"
import {
  Home,
  Shield,
  Activity,
  FileText,
  Clock,
  Settings,
  Info,
  Zap,
  Search,
  Unlock
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Custom Scan", url: "/scan/custom", icon: Search },
  { title: "Scheduled Scan", url: "/scan/scheduled", icon: Clock },
  { title: "Recovery Hub", url: "/mitigation", icon: Unlock },
  { title: "Scan Report", url: "/reports", icon: FileText },
  { title: "History", url: "/history", icon: Activity },
  { title: "Threat Analysis", url: "/analysis", icon: Zap },
  { title: "Privacy Advisor", url: "/privacy", icon: Shield },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "About", url: "/about", icon: Info },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-6 w-6" />
          </div>
          {state !== "collapsed" && (
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground">Ransomware</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Defender</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="hover:bg-primary/10 data-[active=true]:bg-primary/20 data-[active=true]:text-primary"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/40">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {state !== "collapsed" && (
            <span className="text-xs font-medium text-muted-foreground">System Protected</span>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
