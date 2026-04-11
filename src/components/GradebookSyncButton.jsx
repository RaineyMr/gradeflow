import React from 'react'
import { useStore } from '../lib/store'

export function GradebookSyncButton() {
  const isSyncing = useStore(state => state.isSyncingGradebook)
  const lastSync  = useStore(state => state.lastDistrictGradebookSync)
  const sync      = useStore(state => state.syncGradebookToDistrict)

  const handleClick = async () => {
    await sync()
  }

  return (
    <div className="flex items-center gap-2 mobile-sync-gap">
      <button
        onClick={handleClick}
        disabled={isSyncing}
        className="px-2 py-1 rounded-md text-xs font-medium bg-blue-600 text-white disabled:opacity-60 mobile-sync-btn"
      >
        {isSyncing ? 'Syncing…' : 'Sync Gradebook'}
      </button>
      {lastSync && (
        <span className="text-xs text-gray-500">
          Last sync: {new Date(lastSync).toLocaleString()}
        </span>
      )}
    </div>
  )
}
