'use client'

import TopBar from "@/components/ui/topbar"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Suspense } from "react"
import { User } from "@supabase/supabase-js"

type UserProfile = {
  username: string
  avatar_url: string
  bio: string
  email_notifications: boolean
}

const AccountPage = () => {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: '',
    avatar_url: '',
    bio: '',
    email_notifications: true
  })
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Get user profile from database
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          
        if (data) {
          setUserProfile({
            username: data.username || '',
            avatar_url: data.avatar_url || '',
            bio: data.bio || '',
            email_notifications: data.email_notifications !== false
          })
        }
      } else {
        // Not logged in
        router.push('/auth/login')
      }
      
      setLoading(false)
    }
    
    getUser()
  }, [supabase, router])
  
  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(null)
    setError(null)
    
    try {
      if (!user) return
      
      // Update user profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          username: userProfile.username,
          bio: userProfile.bio,
          avatar_url: userProfile.avatar_url,
          email_notifications: userProfile.email_notifications,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (error) throw error
      setSuccess('profile updated successfully')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setError(error.message || 'error updating profile')
    } finally {
      setSaving(false)
    }
  }
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }
  
  const handlePasswordChange = async () => {
    if (!user?.email) return
    
    try {
      setError(null)
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${location.origin}/auth/reset-password`
      })
      
      if (error) throw error
      setSuccess('password reset link sent to your email')
    } catch (error: any) {
      console.error('Error sending password reset:', error)
      setError(error.message || 'error sending password reset')
    }
  }
  
  if (loading) {
    return (
      <main className="min-h-dvh w-full flex flex-col">
        <TopBar/>
        <div className="flex-1 flex justify-center items-center">
          <p className="text-xl font-medium">[loading...]</p>
        </div>
      </main>
    )
  }
  
  return (
    <main className="min-h-dvh w-full flex flex-col">
      <TopBar/>
      <div className="flex-1 w-full h-full max-w-2xl mx-auto py-8 px-6">
        <h1 className="text-3xl font-bold mb-6">account settings</h1>
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="p-6 rounded-xl bg-[#EBEBEB] dark:bg-[#151515]">
            <h2 className="text-xl font-bold mb-4">profile</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="font-medium mb-2">profile picture</label>
                <div className="flex items-center">
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-4">
                    <img 
                      src={userProfile.avatar_url || "/api/placeholder/80/80"} 
                      alt="Avatar" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <input 
                      type="text" 
                      placeholder="Avatar URL"
                      className="py-2 px-3 w-full rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-700 focus:outline-none"
                      value={userProfile.avatar_url}
                      onChange={(e) => setUserProfile({...userProfile, avatar_url: e.target.value})}
                    />
                    <p className="text-sm text-gray-500 mt-1">enter a URL to your profile image</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="font-medium mb-2">username</label>
                <div className="bg-gradient-to-b p-px rounded-lg from-[#BCBCBC] dark:from-[#454545] to-[#9C9C9C] dark:to-[#5A5A5A]">
                  <input
                    type="text"
                    className="w-full py-2 px-3 rounded-md bg-[#EBEBEB] dark:bg-[#151515] focus:outline-0"
                    value={userProfile.username}
                    onChange={(e) => setUserProfile({...userProfile, username: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="font-medium mb-2">bio</label>
                <div className="bg-gradient-to-b p-px rounded-lg from-[#BCBCBC] dark:from-[#454545] to-[#9C9C9C] dark:to-[#5A5A5A]">
                  <textarea
                    className="w-full py-2 px-3 rounded-md bg-[#EBEBEB] dark:bg-[#151515] focus:outline-0 min-h-24"
                    value={userProfile.bio}
                    onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Account Section */}
          <div className="p-6 rounded-xl bg-[#EBEBEB] dark:bg-[#151515]">
            <h2 className="text-xl font-bold mb-4">account</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="font-medium mb-2">email</label>
                <div className="bg-gray-200 dark:bg-gray-700 py-2 px-3 rounded-lg">
                  <p>{user?.email}</p>
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  type="button"
                  onClick={handlePasswordChange}
                  className="h-12 px-6 cursor-pointer bg-[#1A1A1A] dark:bg-white dark:text-black rounded-xl font-medium text-white"
                >
                  change password
                </button>
              </div>
            </div>
          </div>
          
          {/* Notifications Section */}
          <div className="p-6 rounded-xl bg-[#EBEBEB] dark:bg-[#151515]">
            <h2 className="text-xl font-bold mb-4">notifications</h2>
            
            <div className="space-y-4">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  className="h-5 w-5 rounded"
                  checked={userProfile.email_notifications}
                  onChange={(e) => setUserProfile({...userProfile, email_notifications: e.target.checked})}
                />
                <span className="ml-3">receive email notifications</span>
              </label>
            </div>
          </div>
          
          {/* Status and Action Buttons */}
          <div className="flex flex-col space-y-4">
            {success && <p className="text-green-600 dark:text-green-400">{success}</p>}
            {error && <p className="text-red-600 dark:text-red-400">error: {error.toLowerCase()}</p>}
            
            <div className="flex justify-between">
              <button 
                type="submit"
                disabled={saving}
                className="h-14 px-6 cursor-pointer bg-[#1A1A1A] dark:bg-white dark:text-black rounded-xl font-medium text-lg text-white disabled:opacity-70"
              >
                {saving ? 'saving...' : 'save changes'}
              </button>
              
              <button 
                type="button"
                onClick={handleSignOut}
                className="h-14 px-6 cursor-pointer bg-transparent border border-[#1A1A1A] dark:border-white rounded-xl font-medium text-lg"
              >
                sign out
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}

export default function SuspenseExport() {
  return (
    <Suspense>
      <AccountPage/>
    </Suspense>
  )
}