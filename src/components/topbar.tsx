'use client'
import { useState } from "react"
import { FiMoon, FiSun, FiSliders } from "react-icons/fi"
import Image from "next/image"
import { useTheme } from "next-themes"

type AccountDetails = {
  username: string;
  profilePicUrl: string;
}

const TopBar = () => {
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>()
  const { setTheme, theme } = useTheme()
  return (
    <div className="min-h-21 flex w-full justify-between items-center px-6 select-none">
      <p className="font-bold text-3xl">feedback hub</p>
      <div className="h-full flex items-center space-x-2 sm:space-x-7">
        {accountDetails&&(
          <div className="flex-row items-center flex px-1.5 space-x-2.5">
            <Image 
              src={accountDetails.profilePicUrl}
              className="rounded-full"
              width={32}
              height={32}
              alt={"profile pic"}
            />
            <p className="font-bold text-base hidden sm:block">{accountDetails.username}</p>
            <div className="w-6 h-6 justify-center items-center flex cursor-pointer">
              <FiSliders size={20} />
            </div>
          </div>
        )}
        <button className="w-6 h-6 cursor-pointer" onClick={() => theme=="light"?setTheme("dark"):setTheme("light")}>
          {theme=="light"?<FiMoon size={24} />:<FiSun size={24} />}
        </button>
      </div>
    </div>
  )
}

export default TopBar