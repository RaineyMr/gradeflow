import React from 'react'
import { useStore } from '@lib/store'
import { useIsMobile } from '@lib/utils'
import AppShell from './AppShell'
import MobileLayout from '@layouts/MobileLayout'

export default function SupportStaffLayoutWrapper({ children }) {
  const { currentUser } = useStore()
  const isMobile = useIsMobile()

  // Only apply mobile layout for support staff on mobile devices
  if (currentUser?.role === 'supportStaff' && isMobile) {
    return <MobileLayout>{children}</MobileLayout>
  }

  return <AppShell>{children}</AppShell>
}
