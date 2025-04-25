'use client'

import TopBar from "@/components/ui/topbar"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react"

type Game = {
  id: number;
  thumbnail: string;
  name: string;
}

const Home = () => {
  const [games, setGames] = useState<Game[]>([
    {
      id: 313131,
      thumbnail: "https://tr.rbxcdn.com/180DAY-c97cc7e5a99162fbcf0ab990500bd4de/768/432/Image/Webp/noFilter",
      name: "BikeWorld 🔥"
    },
    {
      id: 69420,
      thumbnail: "https://tr.rbxcdn.com/180DAY-2f03dd743fcc4a541c0bb88d76bc8fa1/768/432/Image/Webp/noFilter",
      name: "🔵Circle Grinding Inc."
    },
    {
      id: 313131,
      thumbnail: "https://tr.rbxcdn.com/180DAY-fac36a23cfeb9b18e1c477c1082ffa50/768/432/Image/Webp/noFilter",
      name: "[🎇X2 STATS🎇] MILK UPGRADE TREE 😋"
    }
    ])
  return (
    <main className="min-h-screen px-6 w-full flex flex-col">
      <TopBar/>
      <div className="flex-1 w-full max-w-7xl mx-auto py-4 pb-11 px-6 overflow-y-auto">
        {games?.length > 0 ? <GamesList games={games} /> : <NoGamesAdded/>}
      </div>
    </main>
  )
}

const GamesList = ({ games } : { games:Game[] }) => {
  const router = useRouter()
  return (
    <div className="w-full flex flex-col items-center space-y-3.5 overscroll-x-hidden">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((gameData, i) => (
          <button 
            key={i}
            className="relative select-none flex items-end w-full aspect-video cursor-pointer bg-black rounded-2xl before:absolute before:inset-0 before:bg-black/80 before:rounded-2xl bg-center bg-cover p-4"
            style={{ backgroundImage: `url(${gameData.thumbnail})` }}
            onClick={() => router.push(`/feedbacks/${gameData.id}`)}
          >
            <p className="font-bold text-3xl text-start text-white drop-shadow-md">
              {gameData.name}
            </p>
          </button>
        ))}
      </div>
      <AddGameButton/>
    </div>
  )
}

const NoGamesAdded = () => {
  return (
    <div className="w-full h-full flex justify-center items-center flex-col space-y-3.5">
      <p className="text-3xl font-bold">you haven't added any games.</p>
      <AddGameButton/>
    </div>
  )
}

const AddGameButton = () => {
  const router = useRouter()
  return (
    <button onClick={() => router.push("/add-game")} className="h-14 w-72 bg-[#1A1A1A] cursor-pointer dark:bg-white dark:text-black rounded-xl font-medium text-lg text-white">
      add game
    </button>
  )
}

export default Home