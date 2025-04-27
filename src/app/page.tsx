'use client'

import TopBar from "@/components/ui/topbar"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

type game = {
  id: number;
  added_at: string;
  owner: string;
  universe_id: number;
  game_title: string;
  game_cover_url: string;
}

const Home = () => {
  const [games, setGames] = useState<game[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  
  useEffect(() => {
    async function fetchGames() {
      const res = await fetch('/api/retrieve-games', { next: { tags: ['games'], revalidate: 3600 } })
      const data = await res.json()
      setGames(data["data"])
      setLoading(false)
    }
    fetchGames()
  }, [])
  
  return (
    <main className="min-h-dvh w-full flex flex-col">
      <TopBar/>
      <div className={`flex-1 w-full h-full max-w-7xl mx-auto py-4 pb-11 px-6 overflow-y-auto ${(!games || !Array.isArray(games) || games.length <= 0) && 'flex items-center pb-20'}`}>
        {games?.length > 0 && <GamesList games={games} />}
        {(games?.length <= 0 && !loading) && <NoGamesAdded/>}
        {loading && <p className="text-xl text-center w-full font-medium">[loading...]</p>}
      </div>
    </main>
  )
}

const GamesList = ({ games } : { games: game[] }) => {
  const router = useRouter()
  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((gameData, i) => (
          <button 
            key={i}
            className="relative select-none flex items-end w-full aspect-video cursor-pointer bg-black rounded-2xl before:absolute before:inset-0 before:bg-black/80 before:rounded-2xl bg-center bg-cover p-4"
            style={{ backgroundImage: `url(${gameData.game_cover_url})` }}
            onClick={() => router.push(`/feedbacks/${gameData.universe_id}`)}
          >
            <p className="font-bold text-3xl text-start text-white drop-shadow-md">
              {gameData.game_title}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

const NoGamesAdded = () => {
  return (
    <div className="w-full h-full flex justify-center items-center flex-col space-y-4">
      <p className="text-3xl font-bold">you haven't added any games.</p>
      <AddGameButton/>
    </div>
  )
}

const AddGameButton = () => {
  const router = useRouter()
  return (
    <button 
      onClick={() => router.push("/add-game")} 
      className="h-14 w-72 cursor-pointer bg-[#1A1A1A] dark:bg-white dark:text-black rounded-xl font-medium text-lg text-white"
    >
      add game
    </button>
  )
}

export default Home