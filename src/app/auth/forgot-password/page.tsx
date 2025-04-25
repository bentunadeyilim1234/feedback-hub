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
      <form onSubmit={handleSubmit} className="flex-col w-full flex px-7.5 sm:px-11 space-y-1">
        <div className="flex-col w-full justify-center flex space-y-2.5 py-2.5">
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
        {error&&<p>error: {error.toLowerCase()}</p>}
        <div className="flex-col w-full justify-center py-2.5 space-y-2.5">
          <button type="submit" className="h-14 cursor-pointer w-full bg-[#1A1A1A] dark:bg-white dark:text-black rounded-xl font-medium text-lg text-white">
            send password reset link
          </button>
          <div className="flex justify-between w-full px-1 mt-2 sm:mt-0 flex-col sm:flex-row">
            <Link href="/auth/login" className="font-medium text-lg sm:text-sm">go back</Link>
          </div>
        </div>
      </form>
    )
  }

  const SuccessMessage = () => {
    return (
      <div className="flex-col w-full flex px-7.5 sm:px-11 space-y-1">
        <div className="flex-col w-full flex p-2.5 font-medium text-xl">
          <p>password reset link was sent to:</p>
          <p className="font-bold">{email||"[your email address]"}</p>
          <p>please check your inbox.</p>
        </div>
        <div className="px-2.5">
          <Link href={"/auth/login"} className="sm:text-base text-lg">go back</Link>
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
    <main className="sm:px-6 w-full h-full items-center flex flex-col">
      <TopBar/>
      <div className="h-full w-full max-w-xl items-center justify-center flex pb-21">
        {success?<SuccessMessage />:<ResetForm />}
      </div>
    </main>
  )
}

export default ForgotPasswordPage