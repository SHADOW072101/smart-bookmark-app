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
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Smart Bookmark App</h1>
          </div>
          
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Welcome to Smart Bookmark App
            </h2>
            <p className="text-gray-600 mb-8">
              Please sign in with Google to start saving your bookmarks
            </p>
            
            {error && (
              <div className="max-w-md mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="font-medium">Error: {error}</p>
                <p className="text-sm mt-2">{errorDescription || 'Authentication failed'}</p>
              </div>
            )}
            
            <div className="flex justify-center">
              <AuthButton />
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Smart Bookmark App</h1>
          <AuthButton />
        </div>
        
        <BookmarkList user={user} />
      </div>
    </main>
  )
}