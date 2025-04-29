import Link from "next/link"

const NotFound = async () => {
  return (
    <main className="w-full h-full flex flex-col items-center dark:bg-black dark:text-white sm:px-6">
      <div className="w-full h-full max-w-xl flex items-center justify-center pb-20">
        <div className="w-full flex flex-col px-5 sm:px-11 space-y-4">
          <div className="w-full flex flex-col space-y-2 font-medium">
            <p className="text-5xl">[404]</p>
            <p className="text-xl">requested page was not found.</p>
          </div>
          <div>
            <Link href="/" className="text-lg sm:text-base cursor-pointer">go back</Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default NotFound