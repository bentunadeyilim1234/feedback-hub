'use client'

import TopBar from "@/components/topbar"

const SignupPage = () => {
  return (
    <main className="sm:px-6 w-full h-full items-center flex flex-col bg-white dark:bg-black">
      <TopBar/>
      <div className="h-full w-full max-w-xl items-center flex">
        <form className="flex-col w-full flex px-5 sm:px-11 space-y-1">
          <div className="flex-col w-full justify-center flex space-y-2.5 p-2.5">
            <label className="text-lg font-medium">email</label>
            <div className="bg-gradient-to-b p-px rounded-lg from-[#BCBCBC] dark:from-[#454545] to-[#9C9C9C] dark:to-[#5A5A5A]">
              <input type="email" name="email" id="email" className="bg-[#EBEBEB] dark:bg-[#151515] py-1 rounded-md w-full focus:outline-0 px-2" required />
            </div>
          </div>
          <div className="flex-col w-full justify-center flex space-y-2.5 p-2.5">
            <label className="text-lg font-medium">username</label>
            <div className="bg-gradient-to-b p-px rounded-lg from-[#BCBCBC] dark:from-[#454545] to-[#9C9C9C] dark:to-[#5A5A5A]">
              <input type="text" name="username" id="username" className="bg-[#EBEBEB] dark:bg-[#151515] py-1 rounded-md w-full focus:outline-0 px-2" required />
            </div>
          </div>
          <div className="flex-col w-full justify-center flex space-y-2.5 p-2.5">
            <label className="text-lg font-medium">password</label>
            <div className="bg-gradient-to-b p-px rounded-lg from-[#BCBCBC] dark:from-[#454545] to-[#9C9C9C] dark:to-[#5A5A5A]">
              <input type="password" name="password" id="password" className="bg-[#EBEBEB] dark:bg-[#151515] py-1 rounded-md w-full focus:outline-0 px-2" required />
            </div>
          </div>
          <div className="flex-col w-full justify-center p-2.5 space-y-2.5">
            <button onClick={() => {alert('hi')}} className="h-14 cursor-pointer w-full bg-[#1A1A1A] dark:bg-white dark:text-black rounded-xl font-medium text-lg text-white">
              sign up
            </button>
            <div className="flex justify-between w-full px-1 mt-2 sm:mt-0 flex-col sm:flex-row">
              <a href="/auth/login" className="font-medium text-lg sm:text-sm">log in instead</a>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}

export default SignupPage