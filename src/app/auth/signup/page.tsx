'use client'

import ContinueWithGoogleBtn from "@/components/ui/continue-with-google"
import TopBar from "@/components/ui/topbar"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { z } from "zod";

const validType=z.object({
  username: z.string().min(5),
  email: z.string().email(),
  password: z.string().min(8)
})

const SignupPage = () => {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [validationError, setValidationError] = useState<string>();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` }
    })
    if (error) router.push('/auth/signup?error=' + encodeURIComponent(error.message))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      validType.parse({
        username: username,
        email: email,
        password: password
      })
      setValidationError("")
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message)
      }
    }
  }
  
  return (
    <main className="w-full h-full flex flex-col items-center">
      <TopBar/>
      <div className="w-full h-full max-w-xl flex items-center pb-20">
        <form autoComplete="off" onSubmit={handleSubmit} className="w-full flex flex-col px-5 sm:px-11 space-y-4">
          <input autoComplete="false" name="hidden" type="text" style={{ display: "none" }} />
          
          <div className="w-full flex flex-col space-y-2 p-2">
            <label className="text-lg font-medium">email</label>
            <div className="bg-gradient-to-b p-px rounded-lg from-[#BCBCBC] dark:from-[#454545] to-[#9C9C9C] dark:to-[#5A5A5A]">
              <input
                type="email"
                name="email"
                id="email"
                className="w-full py-1 px-2 rounded-md bg-[#EBEBEB] dark:bg-[#151515] focus:outline-0"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full flex flex-col space-y-2 p-2">
            <label className="text-lg font-medium">username</label>
            <div className="bg-gradient-to-b p-px rounded-lg from-[#BCBCBC] dark:from-[#454545] to-[#9C9C9C] dark:to-[#5A5A5A]">
              <input
                type="text"
                name="username"
                id="username"
                className="w-full py-1 px-2 rounded-md bg-[#EBEBEB] dark:bg-[#151515] focus:outline-0"
                required
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full flex flex-col space-y-2 p-2">
            <label className="text-lg font-medium">password</label>
            <div className="bg-gradient-to-b p-px rounded-lg from-[#BCBCBC] dark:from-[#454545] to-[#9C9C9C] dark:to-[#5A5A5A]">
              <input
                type="password"
                name="password"
                id="password"
                className="w-full py-1 px-2 rounded-md bg-[#EBEBEB] dark:bg-[#151515] focus:outline-0"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p>error: {error.toLowerCase()}</p>}
            {validationError && <p>error: {validationError.toLowerCase()}</p>}
          </div>
          
          <div className={`w-full flex flex-col p-2 space-y-4 ${error ? 'pt-0' : ''}`}>
            <button type="submit" className="w-full h-14 cursor-pointer bg-[#1A1A1A] dark:bg-white dark:text-black rounded-xl font-medium text-lg text-white">
              sign up
            </button>
            <ContinueWithGoogleBtn onClick={handleGoogleSignup} /> 
            <div className="w-full flex justify-start px-1 mt-2 sm:mt-0">
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