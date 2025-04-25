'use client'
import { useEffect, useState } from "react"
import { FiMoon, FiSun, FiSliders } from "react-icons/fi"
import Image from "next/image"
import { useTheme } from "next-themes"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const TopBar = () => {
  const [accountDetails, setAccountDetails] = useState<User | null>()
  const supabase = createClient()
  const router = useRouter()
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setAccountDetails(user)
    }
    getUser()
  }, [supabase.auth])
  const handleSignOut = () => {
    supabase.auth.signOut().then(() => {
      router.push('/auth/login')
    })
  }

  const { setTheme, theme } = useTheme()
  return (
    <div className="min-h-21 flex w-full justify-between items-center px-6 select-none">
      <p className="font-bold text-3xl">feedback hub</p>
      <div className="h-full flex items-center space-x-2 sm:space-x-7">
        {accountDetails&&(
          <div className="flex-row items-center flex px-1.5 space-x-2.5">
            {accountDetails.user_metadata.avatar_url&&
            <Image 
              src={accountDetails.user_metadata.avatar_url||""}
              className="rounded-full pointer-events-none"
              width={32}
              height={32}
              alt={"profile pic"}
            />
            }
            <p className="font-bold text-base hidden sm:block">{accountDetails.user_metadata.username}</p>
            <div className="w-6 h-6 justify-center items-center flex">
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                  <FiSliders size={20}/>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="dark:bg-black">
                  <DropdownMenuItem onClick={() => alert(accountDetails.user_metadata.username)}>your account</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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