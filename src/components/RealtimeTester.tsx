'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function RealtimeTester({ user }: { user: any }) {
  const [events, setEvents] = useState<string[]>([])
  const [status, setStatus] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    console.log('🧪 [Tester] Setting up test subscription')
    
    const channel = supabase
      .channel('test-channel-' + Date.now())
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🧪 [Tester] EVENT RECEIVED:', payload)
          setEvents(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ${payload.eventType}: ${JSON.stringify(payload.new || payload.old)}`
          ])
        }
      )
      .subscribe((status) => {
        console.log('🧪 [Tester] Subscription status:', status)
        setStatus(status)
      })

    return () => {
      console.log('🧪 [Tester] Cleaning up')
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

    console.log('🧪 [Tester] Insert result:', { data, error })
  }

  if (!user) return null

  return (
    <div className="mt-8 p-4 border-2 border-purple-500 rounded-lg bg-purple-50">
      <h3 className="text-lg font-bold text-purple-800 mb-2">🧪 Realtime Tester</h3>
      <p className="text-sm mb-2">Status: <span className={status === 'SUBSCRIBED' ? 'text-green-600' : 'text-red-600'}>{status}</span></p>
      <button
        onClick={testInsert}
        className="mb-4 px-3 py-1 bg-purple-500 text-white rounded text-sm"
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