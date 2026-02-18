// 'use client'

// import { useEffect, useState, useCallback } from 'react'
// import { createClient } from '@/lib/supabase/client'
// import RealtimeProvider from './RealtimeProvider'
// import RealtimeTester from './RealtimeTester'
// import RealtimeMonitor from './RealtimeMonitor'

// type Bookmark = {
//   id: number
//   title: string
//   url: string
//   created_at: string
//   user_id: string
// }

// export default function BookmarkList({ user }: { user: any }) {
//   const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
//   const [title, setTitle] = useState('')
//   const [url, setUrl] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [showTester, setShowTester] = useState(false)
//   const supabase = createClient()

//   // Fetch bookmarks function
//   const fetchBookmarks = useCallback(async () => {
//     try {
//       console.log('📚 Fetching bookmarks for user:', user.id)
//       const { data, error } = await supabase
//         .from('bookmarks')
//         .select('*')
//         .order('created_at', { ascending: false })

//       if (error) throw error
//       console.log('📚 Fetched bookmarks:', data?.length || 0, 'bookmarks')
//       if (data) {
//         setBookmarks(data)
//       }
//     } catch (error: any) {
//       console.error('📚 Error fetching bookmarks:', error)
//       setError(error.message)
//     }
//   }, [supabase, user.id])

//   // Initial fetch
//   useEffect(() => {
//     fetchBookmarks()
//   }, [fetchBookmarks])

//   // Handle realtime insert
//   const handleRealtimeInsert = useCallback((newBookmark: Bookmark) => {
//     console.log('🔄 Realtime insert handler called with:', newBookmark)
//     setBookmarks((current) => {
//       // Check if bookmark already exists
//       const exists = current.some(b => b.id === newBookmark.id)
//       if (exists) {
//         console.log('🔄 Bookmark already exists, skipping')
//         return current
//       }
//       console.log('🔄 Adding new bookmark from realtime')
//       return [newBookmark, ...current]
//     })
//   }, [])


//   useEffect(() => {
//   // Listen for storage events (cross-tab communication fallback)
//   const handleStorageChange = (e: StorageEvent) => {
//     if (e.key === 'bookmark-deleted' || e.key === 'bookmark-added') {
//       console.log('📦 Storage event detected, refreshing bookmarks')
//       fetchBookmarks()
//     }
//   }

//   window.addEventListener('storage', handleStorageChange)
  
//   return () => {
//     window.removeEventListener('storage', handleStorageChange)
//   }
// }, [fetchBookmarks])

//   const addBookmark = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!title.trim() || !url.trim()) return

//     setLoading(true)
//     setError(null)
    
//     try {
//       // Format URL
//       let validUrl = url
//       if (!url.startsWith('http://') && !url.startsWith('https://')) {
//         validUrl = 'https://' + url
//       }

//       console.log('➕ Adding bookmark:', { title: title.trim(), url: validUrl })
      
//       const { data, error } = await supabase
//         .from('bookmarks')
//         .insert([
//           {
//             title: title.trim(),
//             url: validUrl,
//             user_id: user.id
//           }
//         ])
//         .select()
//         .single()

//       if (error) throw error
      
//       console.log('➕ Bookmark added successfully:', data)
      
//       // No need for optimistic update here - realtime will handle it
//       // But we'll keep it for immediate feedback
//       if (data) {
//         setBookmarks((current) => [data, ...current])
//       }
      
//       // Clear form
//       setTitle('')
//       setUrl('')
//     } catch (error: any) {
//       console.error('➕ Error adding bookmark:', error)
//       setError(error.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleRealtimeDelete = useCallback((id: number) => {
//   console.log('🔄 [BookmarkList] 🔴 Realtime delete handler called with ID:', id)
//   console.log('🔄 [Booklist] Current bookmarks IDs:', bookmarks.map(b => b.id))
  
//   setBookmarks((current) => {
//     console.log('🔄 [BookmarkList] Current bookmarks in state:', current.map(b => b.id))
    
//     // Check if the bookmark exists before filtering
//     const exists = current.some(b => b.id === id)
//     console.log('🔄 [BookmarkList] Bookmark exists in state:', exists)
    
//     if (!exists) {
//       console.log('🔄 [BookmarkList] Bookmark already removed, skipping')
//       return current
//     }
    
//     const filtered = current.filter(b => {
//       if (b.id === id) {
//         console.log('🔄 [BookmarkList] Removing bookmark:', b)
//         return false
//       }
//       return true
//     })
    
//     console.log('🔄 [BookmarkList] Bookmarks after delete:', filtered.map(b => b.id))
//     console.log('🔄 [BookmarkList] Removed count:', current.length - filtered.length)
    
//     return filtered
//   })
// }, [bookmarks])

// // Also update the manual delete function
// const deleteBookmark = async (id: number) => {
//   try {
//     console.log('➖ [BookmarkList] 🗑️ Manual delete for ID:', id)
    
//     // Store current state for potential rollback
//     const previousBookmarks = [...bookmarks]
    
//     // Optimistic update
//     setBookmarks(current => current.filter(b => b.id !== id))
    
//     // Delete from database
//     const { error } = await supabase
//       .from('bookmarks')
//       .delete()
//       .eq('id', id)

//     if (error) {
//       console.error('➖ [BookmarkList] Delete error:', error)
//       setBookmarks(previousBookmarks)
//       throw error
//     }
    
//     console.log('➖ [BookmarkList] ✅ Bookmark deleted from database, ID:', id)
    
//     // Force other tabs to refresh using localStorage
//     localStorage.setItem('bookmark-deleted', Date.now().toString())
    
//   } catch (error: any) {
//     console.error('➖ [BookmarkList] Error in deleteBookmark:', error)
//     setError(error.message)
//   }
// }

// // // Also update the delete function to ensure we're using the correct ID
// // const deleteBookmark = async (id: number) => {
// //   try {
// //     console.log('➖ Deleting bookmark:', id)
    
// //     // Optimistic update for current tab
// //     setBookmarks((current) => {
// //       console.log('➖ Removing from current tab, ID:', id)
// //       return current.filter((b) => b.id !== id)
// //     })
    
// //     const { error } = await supabase
// //       .from('bookmarks')
// //       .delete()
// //       .eq('id', id)

// //     if (error) {
// //       // Revert on error
// //       console.error('➖ Delete error:', error)
// //       fetchBookmarks()
// //       throw error
// //     }
    
// //     console.log('➖ Bookmark deleted successfully from database:', id)
// //   } catch (error: any) {
// //     console.error('➖ Error deleting bookmark:', error)
// //     setError(error.message)
// //   }
// // }

//   const isValidUrl = (string: string) => {
//     try {
//       new URL(string)
//       return true
//     } catch (_) {
//       try {
//         new URL('https://' + string)
//         return true
//       } catch (_) {
//         return false
//       }
//     }
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       {/* Realtime Provider - This handles cross-tab updates */}
//       <RealtimeProvider 
//         user={user}
//         onInsert={handleRealtimeInsert}
//         onDelete={handleRealtimeDelete}
//         onRefresh={fetchBookmarks}
//       />
//       {/* <RealtimeMonitor bookmarks={bookmarks} /> */}

//       {/* Debug Toggle*/}
//       {/* <div className="mb-4 flex justify-end">
//         <button
//           onClick={() => setShowTester(!showTester)}
//           className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
//         >
//           {showTester ? 'Hide' : 'Show'} Debug Tools
//         </button>
//       </div>

//       Realtime Tester - Only for debugging 
//       {showTester && <RealtimeTester user={user} />}  */}


//       {error && (
//         <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//           <p className="font-medium">Error:</p>
//           <p className="text-sm">{error}</p>
//         </div>
//       )}
      
//       <form onSubmit={addBookmark} className="mb-8 space-y-4">
//         <div>
//           <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
//             Title
//           </label>
//           <input
//             type="text"
//             id="title"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             placeholder="Enter bookmark title"
//             required
//             disabled={loading}
//           />
//         </div>
//         <div>
//           <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
//             URL
//           </label>
//           <input
//             type="url"
//             id="url"
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             placeholder="https://example.com"
//             required
//             disabled={loading}
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={loading || !isValidUrl(url) || !title.trim()}
//           className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
//         >
//           {loading ? 'Adding...' : 'Add Bookmark'}
//         </button>
//       </form>

//       <div className="space-y-4">
//         <div className="flex justify-between items-center">
//           <h2 className="text-xl font-semibold text-gray-800">Your Bookmarks</h2>
//           <span className="text-sm text-gray-500">{bookmarks.length} bookmarks</span>
//         </div>
        
//         {bookmarks.length === 0 ? (
//           <p className="text-gray-500 text-center py-8">No bookmarks yet. Add your first one above!</p>
//         ) : (
//           bookmarks.map((bookmark) => (
//             <div
//               key={bookmark.id}
//               className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
//             >
//               <div className="flex-1 min-w-0">
//                 <h3 className="text-lg font-medium text-gray-900 truncate">{bookmark.title}</h3>
//                 <a
//                   href={bookmark.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-sm text-blue-600 hover:underline truncate block"
//                 >
//                   {bookmark.url}
//                 </a>
//                 <p className="text-xs text-gray-400 mt-1">
//                   Added: {new Date(bookmark.created_at).toLocaleString()}
//                 </p>
//               </div>
//               <button
//                 onClick={() => deleteBookmark(bookmark.id)}
//                 className="ml-4 text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-full transition-colors"
//                 aria-label="Delete bookmark"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                 </svg>
//               </button>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   )
// }


'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import RealtimeProvider from './RealtimeProvider'

type Bookmark = {
  id: number
  title: string
  url: string
  created_at: string
  user_id: string
}

export default function BookmarkList({ user }: { user: any }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTester, setShowTester] = useState(false)
  const supabase = createClient()

  // Fetch bookmarks function
  const fetchBookmarks = useCallback(async () => {
    try {
      console.log('📚 Fetching bookmarks for user:', user.id)
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('📚 Fetched bookmarks:', data?.length || 0, 'bookmarks')
      if (data) {
        setBookmarks(data)
      }
    } catch (error: any) {
      console.error('📚 Error fetching bookmarks:', error)
      setError(error.message)
    }
  }, [supabase, user.id])

  // Initial fetch
  useEffect(() => {
    fetchBookmarks()
  }, [fetchBookmarks])

  // Handle realtime insert
  const handleRealtimeInsert = useCallback((newBookmark: Bookmark) => {
    console.log('🔄 Realtime insert handler called with:', newBookmark)
    setBookmarks((current) => {
      // Check if bookmark already exists
      const exists = current.some(b => b.id === newBookmark.id)
      if (exists) {
        console.log('🔄 Bookmark already exists, skipping')
        return current
      }
      console.log('🔄 Adding new bookmark from realtime')
      return [newBookmark, ...current]
    })
  }, [])


  useEffect(() => {
  // Listen for storage events (cross-tab communication fallback)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'bookmark-deleted' || e.key === 'bookmark-added') {
      console.log('📦 Storage event detected, refreshing bookmarks')
      fetchBookmarks()
    }
  }

  window.addEventListener('storage', handleStorageChange)
  
  return () => {
    window.removeEventListener('storage', handleStorageChange)
  }
}, [fetchBookmarks])

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return

    setLoading(true)
    setError(null)
    
    try {
      // Format URL
      let validUrl = url
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        validUrl = 'https://' + url
      }

      console.log('➕ Adding bookmark:', { title: title.trim(), url: validUrl })
      
      const { data, error } = await supabase
        .from('bookmarks')
        .insert([
          {
            title: title.trim(),
            url: validUrl,
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (error) throw error
      
      console.log('➕ Bookmark added successfully:', data)
      
      // No need for optimistic update here - realtime will handle it
      // But we'll keep it for immediate feedback
      if (data) {
        setBookmarks((current) => [data, ...current])
      }
      
      // Clear form
      setTitle('')
      setUrl('')
    } catch (error: any) {
      console.error('➕ Error adding bookmark:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRealtimeDelete = useCallback((id: number) => {
  console.log('🔄 [BookmarkList] 🔴 Realtime delete handler called with ID:', id)
  console.log('🔄 [Booklist] Current bookmarks IDs:', bookmarks.map(b => b.id))
  
  setBookmarks((current) => {
    console.log('🔄 [BookmarkList] Current bookmarks in state:', current.map(b => b.id))
    
    // Check if the bookmark exists before filtering
    const exists = current.some(b => b.id === id)
    console.log('🔄 [BookmarkList] Bookmark exists in state:', exists)
    
    if (!exists) {
      console.log('🔄 [BookmarkList] Bookmark already removed, skipping')
      return current
    }
    
    const filtered = current.filter(b => {
      if (b.id === id) {
        console.log('🔄 [BookmarkList] Removing bookmark:', b)
        return false
      }
      return true
    })
    
    console.log('🔄 [BookmarkList] Bookmarks after delete:', filtered.map(b => b.id))
    console.log('🔄 [BookmarkList] Removed count:', current.length - filtered.length)
    
    return filtered
  })
}, [bookmarks])

// Also update the manual delete function
const deleteBookmark = async (id: number) => {
  try {
    console.log('➖ [BookmarkList] 🗑️ Manual delete for ID:', id)
    
    // Store current state for potential rollback
    const previousBookmarks = [...bookmarks]
    
    // Optimistic update
    setBookmarks(current => current.filter(b => b.id !== id))
    
    // Delete from database
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('➖ [BookmarkList] Delete error:', error)
      setBookmarks(previousBookmarks)
      throw error
    }
    
    console.log('➖ [BookmarkList] ✅ Bookmark deleted from database, ID:', id)
    
    // Force other tabs to refresh using localStorage
    localStorage.setItem('bookmark-deleted', Date.now().toString())
    
  } catch (error: any) {
    console.error('➖ [BookmarkList] Error in deleteBookmark:', error)
    setError(error.message)
  }
}

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      try {
        new URL('https://' + string)
        return true
      } catch (_) {
        return false
      }
    }
  }

  return (
    <div >
      <div className="max-w-4xl mx-auto">
        {/* Glass Header */}
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-black/10 p-6 mb-8">
          <p className="text-black/90">Your bookmarks sync in real-time across all devices</p>
        </div>

        {/* Realtime Provider */}
        <RealtimeProvider 
          user={user}
          onInsert={handleRealtimeInsert}
          onDelete={handleRealtimeDelete}
          onRefresh={fetchBookmarks}
        />

        {error && (
          <div className="mb-4 p-4 backdrop-blur-lg bg-red-500/20 border border-red-500/30 rounded-xl text-white">
            <p className="font-medium">Error:</p>
            <p className="text-sm text-white/90">{error}</p>
          </div>
        )}
        
        {/* Add Bookmark Form - Glass Style */}
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-black/10 p-6 mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Add New Bookmark</h2>
          <form onSubmit={addBookmark} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-black/80 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-black/20 rounded-xl text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
                placeholder="Enter bookmark title"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-black/80 mb-1">
                URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-black/20 rounded-xl text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
                placeholder="https://example.com"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !isValidUrl(url) || !title.trim()}
              className="w-full bg-white/20 text-black hover:bg-white/50 text-black font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-black/10"
            >
              {loading ? 'Adding...' : 'Add Bookmark'}
            </button>
          </form>
        </div>

        {/* Bookmarks List - Glass Style */}
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-black/10 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-black">Your Bookmarks</h2>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-black backdrop-blur-sm border border-black/20">
              {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
            </span>
          </div>
          
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black/70">No bookmarks yet. Add your first one above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="group backdrop-blur-sm bg-white/5 hover:bg-white/30 border border-black/10 rounded-xl p-4 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-black truncate group-hover:text-black/90">
                        {bookmark.title}
                      </h3>
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-black/60 hover:text-black/80 truncate block transition-colors"
                      >
                        {bookmark.url}
                      </a>
                      <p className="text-xs text-black/40 mt-2">
                        Added: {new Date(bookmark.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteBookmark(bookmark.id)}
                      className="ml-4 p-2 text-black/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      aria-label="Delete bookmark"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug Toggle - Hidden by default, can be enabled if needed */}
        {/* <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowTester(!showTester)}
            className="text-sm px-3 py-1 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 border border-white/20"
          >
            {showTester ? 'Hide' : 'Show'} Debug Tools
          </button>
        </div>

        {showTester && <RealtimeTester user={user} />} */}
      </div>
    </div>
  )
}