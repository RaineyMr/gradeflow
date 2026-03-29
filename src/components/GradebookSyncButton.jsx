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
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={isSyncing}
        className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white disabled:opacity-60"
      >
        {isSyncing ? 'Syncing to District Gradebook…' : 'Sync to District Gradebook'}
      </button>
      {lastSync && (
        <span className="text-xs text-gray-500">
          Last sync: {new Date(lastSync).toLocaleString()}
        </span>
      )}
    </div>
  )
}
