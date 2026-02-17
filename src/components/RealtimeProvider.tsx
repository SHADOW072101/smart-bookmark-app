'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'

type Bookmark = {
  id: number
  title: string
  url: string
  created_at: string
  user_id: string
}

interface RealtimeProviderProps {
  user: any
  onInsert: (bookmark: Bookmark) => void
  onDelete: (id: number) => void
  onRefresh?: () => void
}

export default function RealtimeProvider({ user, onInsert, onDelete, onRefresh }: RealtimeProviderProps) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    console.log('🔔 [Realtime] Setting up for user:', user.id)

    // Clean up existing channel
    if (channelRef.current) {
      channelRef.current.unsubscribe()
    }

    // Create new channel
    const channel = supabase
      .channel(`bookmarks-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 [Realtime] Event received:', payload.eventType, payload)
          
          if (payload.eventType === 'INSERT') {
            console.log('🔔 [Realtime] INSERT for ID:', payload.new.id)
            onInsert(payload.new as Bookmark)
            
            // Also trigger storage event as backup
            localStorage.setItem('bookmark-added', Date.now().toString())
          }
          
          if (payload.eventType === 'DELETE') {
            console.log('🔔 [Realtime] 🔴 DELETE for ID:', payload.old.id)
            console.log('🔔 [Realtime] Full delete payload:', payload.old)
            
            // Call the delete handler
            onDelete(payload.old.id)
            
            // Also trigger storage event as backup
            localStorage.setItem('bookmark-deleted', Date.now().toString())
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 [Realtime] Subscription status:', status)
        
        if (status === 'SUBSCRIBED') {
          console.log('🔔 [Realtime] Successfully subscribed!')
        }
      })

    channelRef.current = channel

    return () => {
      console.log('🔔 [Realtime] Cleaning up')
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [user, onInsert, onDelete, supabase])

  return null
}