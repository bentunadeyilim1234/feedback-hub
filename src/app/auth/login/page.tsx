"use client"

import TopBar from "@/components/topbar"

const LoginPage = () => {
  return (
    <main className="sm:px-6 w-full h-full items-center flex flex-col">
      <TopBar/>
      <div className="h-full w-full max-w-xl items-center flex">
        <div className="flex-col w-full flex px-5 sm:px-11 space-y-3.5">
          <div className="flex-col w-full justify-center flex space-y-2.5 p-2.5">
            <label className="text-lg font-medium">username</label>
            <div className="bg-gradient-to-b p-px rounded-lg from-[#BCBCBC] to-[#9C9C9C]">
              <input type="text" name="username" id="username" className="bg-[#EBEBEB] py-1 rounded-md w-full focus:outline-0 px-2 " />
            </div>
          </div>
          <div className="flex-col w-full justify-center flex space-y-2.5 p-2.5">
            <label className="text-lg font-medium">password</label>
            <div className="bg-gradient-to-b p-px rounded-lg from-[#BCBCBC] to-[#9C9C9C]">
              <input type="password" name="password" id="password" className="bg-[#EBEBEB] py-1 rounded-md w-full focus:outline-0 px-2 " />
            </div>
          </div>
          <div className="flex-col w-full justify-center p-2.5 space-y-2.5">
            <button onClick={() => {alert('hi')}} className="h-14 cursor-pointer w-full bg-black rounded-xl font-medium text-lg text-white">
              login
            </button>
            <div className="flex justify-between w-full px-1 mt-2 sm:mt-0 sm:px-5 flex-col sm:flex-row">
              <a href="#" className="font-medium text-lg sm:text-sm">forgot password?</a>
              <a href="#" className="font-medium text-lg sm:text-sm">don't have an account? sign up</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default LoginPage