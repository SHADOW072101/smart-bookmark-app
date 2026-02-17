'use client'

import { useEffect, useState } from 'react'

interface RealtimeMonitorProps {
  bookmarks: any[]
}

export default function RealtimeMonitor({ bookmarks }: RealtimeMonitorProps) {
  const [events, setEvents] = useState<string[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [bookmarkIds, setBookmarkIds] = useState<string>('')

  // Monitor bookmarks changes
  useEffect(() => {
    setLastUpdate(new Date())
    const ids = bookmarks.map(b => b.id).join(', ')
    setBookmarkIds(ids)
    
    setEvents(prev => [
      ...prev.slice(-9),
      `[${new Date().toLocaleTimeString()}] Bookmarks: ${bookmarks.length} items [${ids}]`
    ])
  }, [bookmarks])

  return (
    <div className="mt-4 p-3 bg-gray-800 text-green-400 rounded-lg font-mono text-xs">
      <div className="flex justify-between mb-2">
        <span className="text-white font-bold">📊 Realtime Monitor</span>
        <span className="text-gray-400">{lastUpdate.toLocaleTimeString()}</span>
      </div>
      <div className="mb-2 text-yellow-400">
        Current IDs: [{bookmarkIds}]
      </div>
      <div className="space-y-1 h-32 overflow-y-auto">
        {events.map((event, i) => (
          <div key={i}>{event}</div>
        ))}
      </div>
    </div>
  )
}