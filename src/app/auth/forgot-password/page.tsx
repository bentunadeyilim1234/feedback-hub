'use client'

import TopBar from "@/components/ui/topbar"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

const ForgotPasswordPage = () => {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const success = searchParams.get('success')
  const [email, setEmail] = useState("");

  const ResetForm = () => {
    return (
      <form onSubmit={handleSubmit} className="w-full flex flex-col px-2 sm:px-8 space-y-4">
        <div className="w-full flex flex-col space-y-2 py-2">
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
        {error && <p>error: {error.toLowerCase()}</p>}
        <div className="w-full flex flex-col py-2 space-y-4">
          <button type="submit" className="w-full h-14 cursor-pointer bg-[#1A1A1A] dark:bg-white dark:text-black rounded-xl font-medium text-lg text-white">
            send password reset link
          </button>
          <div className="w-full px-1 mt-2 sm:mt-0">
            <Link href="/auth/login" className="font-medium text-lg sm:text-sm">go back</Link>
          </div>
        </div>
      </form>
    )
  }

  const SuccessMessage = () => {
    return (
      <div className="w-full flex flex-col sm:px-11 space-y-4">
        <div className="w-full flex flex-col p-2 font-medium">
          <p className="text-xl">password reset link was sent to:</p>
          <p className="text-xl font-bold">{email || "[your email address]"}</p>
          <p className="text-xl">please check your inbox.</p>
        </div>
        <div className="px-2">
          <Link href="/auth/login" className="text-lg sm:text-base">go back</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`
    })

    if (error) {
      router.push('/auth/forgot-password?error=' + encodeURIComponent(error.message))
    } else {
      router.push('/auth/forgot-password?success=true')
    }
  }

  return (
    <main className="w-full h-full flex flex-col items-center">
      <TopBar/>
      <div className="w-full px-5 h-full max-w-xl flex items-center justify-center pb-20">
        {success ? <SuccessMessage /> : <ResetForm />}
      </div>
    </main>
  )
}

export default ForgotPasswordPage