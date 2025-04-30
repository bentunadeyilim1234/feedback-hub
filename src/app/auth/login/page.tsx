"use client"

import TopBar from "@/components/ui/topbar"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useState } from "react"
import ContinueWithGoogleBtn from "@/components/ui/continue-with-google"
import { z } from "zod";

export const validType=z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const LoginPage = () => {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [validationError, setValidationError] = useState<string>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` }
    })
    if (error) router.push('/auth/login?error=' + encodeURIComponent(error.message))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      validType.parse({
        email: email,
        password: password
      })
      setValidationError("")
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) {
        router.push('/auth/login?error=' + encodeURIComponent(error.message))
      } else {
        router.push('/')
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
              log in
            </button>
            <ContinueWithGoogleBtn onClick={handleGoogleLogin} /> 
            <div className="w-full flex flex-col sm:flex-row justify-between px-1 mt-2 sm:mt-0">
              <Link href="/auth/forgot-password" className="font-medium text-lg sm:text-sm">forgot password?</Link>
              <Link href="/auth/signup" className="font-medium text-lg sm:text-sm">{"don't have an account? sign up"}</Link>
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
      <LoginPage/>
    </Suspense>
  )
}