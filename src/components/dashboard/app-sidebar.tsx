"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Building2,
  CreditCard,
  Home,
  Settings,
  Shield,
  Users,
  FileText,
  Activity,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'

const navigation = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: Home,
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        title: 'Organizations',
        url: '/dashboard/organizations',
        icon: Building2,
      },
      {
        title: 'Users',
        url: '/dashboard/users',
        icon: Users,
      },
    ],
  },
  {
    title: 'Analytics',
    items: [
      {
        title: 'Platform Analytics',
        url: '/dashboard/analytics',
        icon: BarChart3,
      },
      {
        title: 'Revenue & Billing',
        url: '/dashboard/billing',
        icon: CreditCard,
      },
      {
        title: 'Activity Logs',
        url: '/dashboard/activity',
        icon: Activity,
      },
    ],
  },
  {
    title: 'Security',
    items: [
      {
        title: 'Security Center',
        url: '/dashboard/security',
        icon: Shield,
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Content Management',
        url: '/dashboard/content',
        icon: FileText,
      },
      {
        title: 'Settings',
        url: '/dashboard/settings',
        icon: Settings,
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Genkō Admin</span>
            <span className="text-xs text-muted-foreground">Healthcare Platform</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}