'use client'

import { MouseEventHandler } from "react"
import { FcGoogle } from "react-icons/fc"

const ContinueWithGoogleBtn = ({ onClick } : { onClick:MouseEventHandler }) => {
  return ( 
    <button
      onClick={onClick}
      className="w-full h-14 rounded-xl border border-gray-300 dark:border-[#454545] cursor-pointer bg-white dark:bg-black transition-colors flex items-center justify-center gap-3"
    >
      <FcGoogle className="w-5 h-5" />
      <span className="font-medium text-black dark:text-white">continue with google</span>
    </button>
  )
}

export default ContinueWithGoogleBtn