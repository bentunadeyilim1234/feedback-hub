'use client'

import ContinueWithGoogleBtn from "@/components/ui/continue-with-google"
import TopBar from "@/components/ui/topbar"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

const SignupPage = () => {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` }
    })
    if (error) router.push('/auth/signup?error=' + encodeURIComponent(error.message))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/`,
        data: {
          username: username,
        },
      },
    })

    if (error) {
      router.push('/auth/signup?error=' + encodeURIComponent(error.message))
    } else {
      router.push('/auth/verify-email?email=${encodeURIComponent(email)}')
    }
  }
  return (
    <main className="sm:px-6 w-full h-full items-center flex flex-col">
      <TopBar/>
      <div className="h-full w-full max-w-xl items-center flex pb-21">
        <form autoComplete="off" onSubmit={handleSubmit} className="flex-col w-full flex px-5 sm:px-11">
          <input autoComplete="false" name="hidden" type="text" style={{ display: "none" }} />
          <div className="flex-col w-full justify-center flex space-y-2.5 p-2.5">
            <label className="text-lg font-medium">email</label>
            <div className="bg-gradient-to-b p-px rounded-lg from-[#BCBCBC] dark:from-[#454545] to-[#9C9C9C] dark:to-[#5A5A5A]">
              <input
                type="email"
                name="email"
                id="email"
                className="bg-[#EBEBEB] dark:bg-[#151515] py-1 rounded-md w-full focus:outline-0 px-2"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-col w-full justify-center flex space-y-2.5 p-2.5">
            <label className="text-lg font-medium">username</label>
            <div className="bg-gradient-to-b p-px rounded-lg from-[#BCBCBC] dark:from-[#454545] to-[#9C9C9C] dark:to-[#5A5A5A]">
              <input
                type="text"
                name="username"
                id="username"
                className="bg-[#EBEBEB] dark:bg-[#151515] py-1 rounded-md w-full focus:outline-0 px-2"
                required
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-col w-full justify-center flex space-y-2.5 p-2.5">
            <label className="text-lg font-medium">password</label>
            <div className="bg-gradient-to-b p-px rounded-lg from-[#BCBCBC] dark:from-[#454545] to-[#9C9C9C] dark:to-[#5A5A5A]">
              <input
                type="password"
                name="password"
                id="password"
                className="bg-[#EBEBEB] dark:bg-[#151515] py-1 rounded-md w-full focus:outline-0 px-2"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error&&<p>error: {error.toLowerCase()}</p>}
          </div>
          <div className={`flex-col w-full justify-center p-2.5 ${error&&'py-0'} space-y-2.5`}>
            <button type="submit" className="h-14 cursor-pointer w-full bg-[#1A1A1A] dark:bg-white dark:text-black rounded-xl font-medium text-lg text-white">
              sign up
            </button>
            <ContinueWithGoogleBtn onClick={handleGoogleSignup} /> 
            <div className="flex justify-between w-full px-1 mt-2 sm:mt-0 flex-col sm:flex-row">
              <Link href="/auth/login" className="font-medium text-lg sm:text-sm">log in instead</Link>
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
      <SignupPage/>
    </Suspense>
  )
}