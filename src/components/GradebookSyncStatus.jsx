import React from 'react'
import { useStore } from '../lib/store'

export function GradebookSyncStatus() {
  const isSyncing = useStore(state => state.isSyncingGradebook)
  const lastSync  = useStore(state => state.lastDistrictGradebookSync)

  if (isSyncing) {
    return (
      <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
        <span className="animate-spin">⏳</span>
        <span>Syncing…</span>
      </div>
    )
  }

  if (!lastSync) {
    return (
      <div className="flex items-center gap-1 text-gray-500 text-sm">
        <span>⚠</span>
        <span>Never synced</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
      <span>✔</span>
      <span>Synced</span>
    </div>
  )
}
