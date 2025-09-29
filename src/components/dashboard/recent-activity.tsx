"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Activity {
  id: string
  user: string
  action: string
  target: string
  timestamp: string
  avatar?: string
}

export function RecentActivity() {
  // Mock data - would come from audit logs
  const activities: Activity[] = [
    {
      id: '1',
      user: 'Dr. Sarah Johnson',
      action: 'created',
      target: 'new patient record',
      timestamp: '2 minutes ago',
      avatar: '/avatars/sarah.jpg',
    },
    {
      id: '2',
      user: 'Admin User',
      action: 'updated',
      target: 'organization settings',
      timestamp: '5 minutes ago',
    },
    {
      id: '3',
      user: 'Nurse Mike Chen',
      action: 'completed',
      target: 'appointment #1234',
      timestamp: '10 minutes ago',
      avatar: '/avatars/mike.jpg',
    },
    {
      id: '4',
      user: 'Dr. Emily Davis',
      action: 'scheduled',
      target: 'follow-up appointment',
      timestamp: '15 minutes ago',
      avatar: '/avatars/emily.jpg',
    },
    {
      id: '5',
      user: 'System',
      action: 'processed',
      target: 'insurance claim #5678',
      timestamp: '20 minutes ago',
    },
  ]

  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.avatar} alt={activity.user} />
            <AvatarFallback>
              {activity.user.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.user}
            </p>
            <p className="text-sm text-muted-foreground">
              {activity.action} {activity.target}
            </p>
          </div>
          <div className="ml-auto font-medium text-xs text-muted-foreground">
            {activity.timestamp}
          </div>
        </div>
      ))}
    </div>
  )
}