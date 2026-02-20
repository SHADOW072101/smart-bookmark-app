import { createClient } from '@/lib/supabase/server'
import AuthButton from '@/components/AuthButton'
import BookmarkList from '@/components/BookmarkList'
import { redirect } from 'next/navigation'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  const params = await searchParams
  const error = params.error
  const errorDescription = params.error_description
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If there's an error param, we'll show it on the login page
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-yellow-200 via-yellow-350 to-yellow-500">
        <div className="max-w-screen mx-auto p-6">
          {/* Glass Header */}
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-black/10 p-6 mb-8">
          <h1 className="text-3xl font-bold text-black opacity-85 mb-2">Smart Bookmark App</h1>
        </div>
          
          {/* Glass Login Card */}
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-black/10 p-8 max-w-md mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-black mb-4">
                Welcome to Smart Bookmark App
              </h2>
              <p className="text-black/70 mb-8">
                Please sign in with Google to start saving your bookmarks
              </p>
              
              {error && (
                <div className="mb-6 p-4 backdrop-blur-lg bg-red-500/20 border border-red-500/30 rounded-xl">
                  <p className="font-medium text-black">Error: {error}</p>
                  <p className="text-sm text-white/90 mt-2">{errorDescription || 'Authentication failed'}</p>
                </div>
              )}
              
              <div className="flex justify-center">
                <AuthButton />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-200 via-yellow-350 to-yellow-500">
      <div className="max-w-screen mx-auto p-6">
        {/* Glass Header with Auth */}
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-black/10 p-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-black opacity-85">Smart Bookmark App</h1>

            <div>
              <AuthButton />
            </div>
          </div>
        </div>

        {/* Bookmark List */}
        <BookmarkList user={user} />
      </div>
    </main>
  )
}