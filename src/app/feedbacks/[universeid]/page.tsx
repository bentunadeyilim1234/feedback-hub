'use client'

import TopBar from "@/components/ui/topbar"
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

TimeAgo.addDefaultLocale(en)

type Game = {
  id: number;
  added_at: string;
  owner: string;
  created: boolean;
  game_title: string;
  place_id: number;
  universe_id: number;
  game_cover_url: string;
  game_icon_url: string;
  updated_at: string;
}

type Feedback = {
  id: number;
  created_at: string;
  game_id: number;
  author_id: number;
  author_displayname: string | null;
  author_username: string;
  author_avatar_url: string;
  rating: number;
  feedback_content: string | null;
  game_owner: string;
}

const FeedbacksPage = () => {
  const [gameDetails, setGameDetails] = useState<Game>()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { universeid } = useParams()
  useEffect(() => {
    async function fetchDetails() {
      const res = await fetch('/api/get-feedbacks', {
        method: "POST",
        body: JSON.stringify({ universe_id: universeid })
      })
      const data = await res.json()
      setIsLoading(false)
      setGameDetails(data["game_details"])
      setFeedbacks(data["feedbacks"])
    }
    fetchDetails()
  }, [])

  return (
    <main className="w-full h-full flex flex-col items-center">
      <TopBar/>
      <div className="w-full px-6 h-full space-y-4 pb-21 overflow-x-hidden">
        {gameDetails&&<GameBadge gameDetails={gameDetails} />}
        <div className="space-y-2.5 max-w-xl mx-auto">
          {feedbacks.map((feedback: Feedback) => (
            <FeedbackItem feedbackDetails={feedback} key={feedback.id} />
          ))}
          {isLoading&&<p className="text-xl text-center w-full font-medium">[loading...]</p>}
        </div>
      </div>
    </main>
  )
}

const GameBadge = (props: any) => {
  const { gameDetails } : { gameDetails: Game } = props
  return(
    <div className="space-x-3.5 flex flex-row items-start sm:items-center max-w-xl mx-auto">
      <Image
        src={gameDetails.game_icon_url}
        alt={gameDetails.game_title}
        width={128}
        height={128}
        className="rounded-xl"
        priority
      />
      <div className="space-y-1">
        <p className="font-bold text-2xl">{gameDetails.game_title}</p>
        <div className="flex-row items-center space-x-2.5 hidden sm:flex">
          <div className="flex-row items-center space-x-1 flex">
            <FiStar className="w-4 h-4 text-red"/>
            <p>4.7/10</p>
          </div>
          <p>[1.5K+ feedbacks]</p>
        </div>
      </div>
    </div>
  )
}

const FeedbackItem = (props: any) => {
  const timeAgo = new TimeAgo('en-US')
  const { feedbackDetails } : { feedbackDetails: Feedback } = props
  return (
    <div className="space-y-0.5 px-2.5 bg-[#F2F2F2] dark:bg-[#151515] p-1.5 rounded-xl">
      <div className="flex sm:justify-between flex-row space-y-0 items-center sm:items-start">
        <div className="flex flex-row items-center space-x-2">
          <Image
            src={feedbackDetails.author_avatar_url}
            alt={feedbackDetails.author_displayname || feedbackDetails.author_username}
            width={48}
            height={48}
            loading="lazy"
          />
          <p className="font-medium text-lg truncate w-72 text-wrap">{
          feedbackDetails.author_displayname
          ? (`${feedbackDetails.author_displayname} (@${feedbackDetails.author_username})`)
          : `@${feedbackDetails.author_username}`
          }</p>
        </div>
        <div className="flex-row items-center space-x-4 hidden sm:flex">
          <p className="text-sm font-bold">{feedbackDetails.rating}/10</p>
          <p>{timeAgo.format(Date.parse(feedbackDetails.created_at))}</p> {/*fix this shyt*/}
        </div>
      </div>
      <div className="py-1 text-lg sm:text-base w-full text-wrap">
        <p>{feedbackDetails.feedback_content}</p>
      </div>
      <div className="space-x-4 block">
        <Link href="#" className="hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black p-0.5">delete</Link>
        <Link href="#" className="hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black p-0.5">details</Link>
      </div>
    </div>
  )
}

export default FeedbacksPage