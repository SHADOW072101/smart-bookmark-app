'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function RealtimeDebug({ user }: { user: any }) {
  const [events, setEvents] = useState<string[]>([])
  const [status, setStatus] = useState<string>('Not connected')
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    setEvents(prev => [...prev, `Setting up realtime for user: ${user.id}`])

    const channel = supabase
      .channel('debug-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 REALTIME EVENT RECEIVED:', payload)
          setEvents(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ${payload.eventType}: ${JSON.stringify(payload.new || payload.old)}`
          ])
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status)
        setStatus(status)
        setEvents(prev => [...prev, `Subscription status: ${status}`])
      })

    return () => {
      console.log('Cleaning up debug channel')
      channel.unsubscribe()
    }
  }, [user])

  const testInsert = async () => {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([
        {
          title: `Test ${new Date().toLocaleTimeString()}`,
          url: 'https://example.com',
          user_id: user.id
        }
      ])
      .select()

    console.log('Test insert result:', { data, error })
    setEvents(prev => [...prev, `Test insert: ${error ? 'Failed' : 'Success'}`])
  }

  return (
    <div className="mt-8 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">🔍 Realtime Debug Panel</h3>
      <p className="text-sm mb-2">Status: <span className={status === 'SUBSCRIBED' ? 'text-green-600' : 'text-red-600'}>{status}</span></p>
      <button 
        onClick={testInsert}
        className="mb-4 px-3 py-1 bg-blue-500 text-white rounded text-sm"
      >
        Test Insert
      </button>
      <div className="bg-black text-green-400 p-2 rounded h-40 overflow-y-auto font-mono text-xs">
        {events.map((event, i) => (
          <div key={i}>{event}</div>
        ))}
      </div>
    </div>
  )
}