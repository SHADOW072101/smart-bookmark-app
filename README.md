# Smart Bookmark App

A modern bookmark manager built with Next.js, Supabase, and Tailwind CSS. Features real-time synchronization across tabs, Google OAuth authentication, and a beautiful glass morphism UI.

## 📸 Screenshots
<img width="1919" height="869" alt="Screenshot 1" src="https://github.com/user-attachments/assets/1f073ad0-aca6-48be-8800-edc1494931cb" />
<img width="1914" height="869" alt="Screenshot 2" src="https://github.com/user-attachments/assets/efc3ca36-7aa9-40f4-a795-f82faaf222f4" />





## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure sign-in with Google (no email/password)
- 📑 **Bookmark Management** - Create and delete bookmarks with titles and URLs
- 🔄 **Real-time Updates** - Bookmarks sync instantly across multiple browser tabs
- 🎨 **Glass Morphism UI** - Modern, sleek interface with frosted glass effects
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔒 **Private Bookmarks** - Each user has their own private bookmark collection

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Authentication**: [Supabase Auth](https://supabase.com/auth) (Google OAuth)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Real-time**: [Supabase Realtime](https://supabase.com/realtime)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Local Setup Guide

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- A Google Cloud Console account

### Step 1: Clone the Repository

```bash
git clone <https://github.com/SHADOW072101/smart-bookmark-app.git>
cd smart-bookmark
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Once created, go to Project Settings → API to get your credentials:
   - Project URL
   - `anon` public key

3. Create the `bookmarks` table with this SQL:

```sql
CREATE TABLE bookmarks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own bookmarks" 
  ON bookmarks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" 
  ON bookmarks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
  ON booksmarks FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

### Step 4: Configure Google OAuth

#### Google Cloud Console Setup:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the Google People API
4. Go to "APIs & Services" → "Credentials"
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Choose "Web application" as application type
7. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - (your Supabase project URL + `/auth/v1/callback`)
8. Save and copy the Client ID and Client Secret

#### Supabase Auth Setup:

1. In Supabase Dashboard, go to Authentication → Providers
2. Enable Google provider
3. Paste your Client ID and Client Secret
4. Save changes

### Step 5: Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 6: Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app.

## 🧪 Testing Real-time Features

To test real-time synchronization:
1. Open the app in two different browser tabs
2. Sign in with the same Google account in both
3. Add a bookmark in one tab
4. Watch it appear instantly in the other tab
5. Delete a bookmark in one tab
6. Verify it disappears from the other tab

## 🚢 Deploy to Vercel

1. Push your code to a GitHub repository
2. Visit [Vercel](https://vercel.com) and import your repository
3. Add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## 🐛 Development Challenges & Solutions

### Challenge 1: Google OAuth Configuration

**Problem**: The app kept showing "Access blocked: This app's request is invalid" error during Google sign-in.

**Solution**: The issue was a mismatch between redirect URIs. We discovered that Supabase uses its own callback URL as an intermediary. The correct configuration required:
- Adding `https://[your-supabase-project].supabase.co/auth/v1/callback` to Google Cloud Console's authorized redirect URIs
- Using Supabase's OAuth flow instead of direct Google authentication

### Challenge 2: Real-time Updates Not Working

**Problem**: Bookmarks were being added to the database but weren't appearing in other browser tabs.

**Solution**: We implemented a multi-layered approach:
1. **Primary Solution**: Proper Supabase realtime subscription with channel filtering by `user_id`
2. **Fallback**: LocalStorage events as a backup communication channel between tabs
3. **Manual Refresh**: Added a refresh button for users to manually sync if needed

Key code for realtime subscription:
```typescript
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
      if (payload.eventType === 'INSERT') {
        // Handle insert
      } else if (payload.eventType === 'DELETE') {
        // Handle delete
      }
    }
  )
  .subscribe()
```

### Challenge 3: Delete Events Not Syncing

**Problem**: INSERT events were syncing across tabs, but DELETE events weren't.

**Investigation**: Console logs revealed that the delete events were being received but not updating the UI. The issue was in the state management.

**Solution**: 
- Added optimistic updates for immediate UI feedback
- Implemented proper cleanup in the realtime subscription
- Used localStorage as a fallback communication channel

```typescript
const deleteBookmark = async (id: number) => {
  // Optimistic update
  setBookmarks(current => current.filter(b => b.id !== id))
  
  // Delete from database
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)
  
  // Force other tabs to refresh
  localStorage.setItem('bookmark-deleted', Date.now().toString())
}
```

### Challenge 4: Maximum Call Stack Size Exceeded

**Problem**: A recursive loop caused by calling `channel.unsubscribe()` inside the subscription callback.

**Solution**: Moved the unsubscribe call outside the callback and used proper cleanup in useEffect:

```typescript
useEffect(() => {
  const channel = setupChannel()
  
  return () => {
    channel.unsubscribe() // Cleanup on unmount
  }
}, [])
```

### Challenge 5: OAuth State Parameter Missing

**Problem**: After Google authentication, the app showed "OAuth state parameter missing" error.

**Solution**: Realized that Supabase manages the OAuth state internally. Removed manual state management and let Supabase handle it:

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    // No manual state parameter needed
  }
})
```

### Challenge 6: Cross-tab State Consistency

**Problem**: Sometimes tabs would get out of sync, showing different bookmark lists.

**Solution**: Implemented multiple sync strategies:
1. Real-time PostgreSQL changes (primary)
2. Storage events as immediate fallback
3. Periodic sync every 30 seconds as last resort
4. Manual refresh button for user-initiated sync

## 📁 Project Structure

```
smart-bookmark/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts        # OAuth callback handler
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page
├── components/
│   ├── AuthButton.tsx           # Google sign-in button
│   ├── BookmarkList.tsx         # Bookmark CRUD operations
│   ├── RealtimeProvider.tsx     # Real-time subscription handler
├── lib/
│   └── supabase/
│       ├── client.ts            # Browser client
│       └── server.ts             # Server client
├── public/                       # Static assets
├── .env.local                    # Environment variables
└── package.json                  # Dependencies
```

## 🔑 Key Learnings

1. **Supabase Realtime**: Requires the table to be added to the `supabase_realtime` publication
2. **OAuth Flow**: Supabase acts as an intermediary between your app and Google
3. **State Management**: Optimistic updates provide better UX but require proper error handling
4. **Cross-tab Communication**: Multiple fallback strategies ensure consistency
5. **Error Handling**: Detailed logging is crucial for debugging real-time issues

## 🎯 Future Improvements

- [ ] Add bookmark editing functionality
- [ ] Implement bookmark categories/tags
- [ ] Add drag-and-drop reordering
- [ ] Export/import bookmarks
- [ ] Share bookmarks with other users
- [ ] Add bookmark search and filtering
- [ ] Browser extension for quick bookmarking

## 📝 License

MIT

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel](https://vercel.com) for hosting

---

Built with ❤️ using Next.js, Supabase, and Tailwind CSS
