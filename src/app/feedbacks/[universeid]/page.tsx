/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client'

import TopBar from "@/components/ui/topbar"
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";
import { useParams } from "next/navigation";
import { useTimeAgo } from 'next-timeago';
import { createClient } from "@/utils/supabase/client";
import { AnimatePresence, motion } from "motion/react";

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

type RealtimeFeedbackData = {
  commit_timestamp: string;
  errors: any;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Feedback,
  old: { id: number; };
  schema: "public";
  table: "feedbacks";
}

type Analytic = {
  avg: number;
  feedbackCount: number;
}

function nFormatter(num: number, digits: number ) { //Thanks to https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K+" },
    { value: 1e6, symbol: "M+" },
    { value: 1e9, symbol: "G+" },
    { value: 1e12, symbol: "T+" },
    { value: 1e15, symbol: "P+" },
    { value: 1e18, symbol: "E+" }
  ];
  const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
  const item = lookup.findLast(item => num >= item.value);
  return item ? (num / item.value).toFixed(digits).replace(regexp, "").concat(item.symbol) : "0";
}

const FeedbacksPage = () => {
  const [gameDetails, setGameDetails] = useState<Game>()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [analytics, setAnalytics] = useState<Analytic>()
  const { universeid } = useParams()
  const supabase = createClient()

  async function handleDelete(feedbackId: number) {
    const res = await fetch('/api/feedbacks/delete/'+feedbackId)
    const data = await res.json()
    if(data.success) {
      setFeedbacks(feedbacks.filter(function( f: Feedback ) {
        return f.id !== feedbackId
      }))
    }
  }

  useEffect(() => {
    async function fetchDetails() {
      const res = await fetch('/api/feedbacks/list/'+universeid)
      const data = await res.json()
      setIsLoading(false)
      setGameDetails(data.game_details)
      setFeedbacks(data.feedbacks)
      data.analytics.feedbackCount = data.feedbacks.length
      setAnalytics(data.analytics)
    }
    fetchDetails()
  }, [universeid])

  useEffect(() => {
    async function subscribeChanges() {
      await supabase.realtime.setAuth() // Needed for Realtime Authorization
      supabase
        .channel(`feedbacks`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feedbacks', filter: 'place_id=eq.'+gameDetails?.place_id },
          (payload: RealtimeFeedbackData | any) => {
          setFeedbacks([payload.new, ...feedbacks])
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'feedbacks', filter: 'place_id=eq.'+gameDetails?.place_id },
          (payload: RealtimeFeedbackData | any) => {
          setFeedbacks(prev => 
            prev.map(item =>
              item.id === payload.old.id ? { ...item, author_avatar_url: payload.new.author_avatar_url } : item
            )
          )
          const index = feedbacks.findIndex((f: Feedback) => f.id == payload.old.id)
          feedbacks[index] = payload.new
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'feedbacks', filter: 'place_id=eq.'+gameDetails?.place_id },
          (payload: RealtimeFeedbackData | any) => {
          setFeedbacks(feedbacks.filter(function( f: Feedback ) {
            return f.id !== payload.old.id
          }))
        })
        .subscribe()
    }
    subscribeChanges()
  }, [supabase, gameDetails, feedbacks, setFeedbacks])

  return (
    <main className="w-full h-full flex flex-col items-center">
      <TopBar/>
      <div className="w-full px-6 h-full space-y-4 pb-21 overflow-x-hidden">
        {gameDetails&&<GameBadge gameDetails={gameDetails} analytics={analytics} />}
        <AnimatePresence>
          <div className="space-y-2.5 max-w-xl mx-auto">
            {feedbacks.map((feedback: Feedback) => (
              <FeedbackItem feedbackDetails={feedback} key={feedback.id} handleDelete={handleDelete} />
            ))}
            {isLoading&&<p className="text-xl text-center w-full font-medium">[loading...]</p>}
          </div>
        </AnimatePresence>
      </div>
    </main>
  )
}

const GameBadge = ({ gameDetails, analytics } : { gameDetails: Game, analytics: Analytic | undefined }) => {
  return(
    <div className="space-x-3.5 flex flex-row items-center max-w-xl mx-auto">
      <Image
        src={gameDetails.game_icon_url}
        alt={gameDetails.game_title}
        width={128}
        height={128}
        className="rounded-lg w-26 h-26 sm:w-32 sm:h-32"
        priority
      />
      <div className="space-y-1">
        <p className="font-bold text-2xl line-clamp-2 sm:line-clamp-3">{gameDetails.game_title}</p>
        {analytics&&
          <div className="items-center space-x-2.5 flex">
            <div className="flex-row items-center space-x-1 flex">
              <FiStar className="w-4 h-4 text-red"/>
              <p>{parseFloat(String(analytics.avg)).toFixed(1)}/10</p>
            </div>
            <p>[{nFormatter(analytics.feedbackCount, 1)} feedbacks]</p>
          </div>
        }
        <div className="space-x-4 text-lg sm:text-base hidden"> {/* hidden per */}
          <Link href="#">[game options]</Link>
        </div>
      </div>
    </div>
  )
}

const FeedbackItem = (props: any) => {
  const { feedbackDetails, handleDelete } : { feedbackDetails: Feedback, handleDelete: Function } = props
  const { TimeAgo } = useTimeAgo();
  //const timeAgo = moment(Date.parse(feedbackDetails.created_at)).fromNow()
  return (
    <motion.div 
      className="space-y-0.5 px-2.5 bg-[#F2F2F2] dark:bg-[#151515] p-1.5 rounded-xl"
      key={feedbackDetails.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex sm:justify-between flex-row space-y-0 items-center sm:items-start">
        <div className="flex flex-row items-center space-x-2 min-h-12">
          <Image
            src={feedbackDetails.author_avatar_url || "/loading.png"}
            alt={feedbackDetails.author_displayname || feedbackDetails.author_username}
            width={48}
            height={48}
            className="rounded-full"
            loading="lazy"
          />
          <p className="font-medium text-lg line-clamp-2 sm:pt-2">{
          feedbackDetails.author_displayname
          ? (`${feedbackDetails.author_displayname} (@${feedbackDetails.author_username})`)
          : `@${feedbackDetails.author_username}`
          }</p>
        </div>
        <div className="flex-row items-center space-x-4 hidden sm:flex">
          {feedbackDetails.feedback_content&&<p className="text-sm font-bold">{feedbackDetails.rating}/10</p>}
          <div className="max-w-32 truncate">
            <TimeAgo date={feedbackDetails.created_at} />
          </div>
        </div>
      </div>
      <div className="py-1 text-lg sm:text-base w-full text-wrap">
        {feedbackDetails.feedback_content
        ? <p>{feedbackDetails.feedback_content}</p>
        : <p className="text-xl px-2 font-bold">{feedbackDetails.rating}/10</p>}
      </div>
      <div className="sm:block p-1 sm:p-0 flex justify-between space-x-8">
        <div className="space-x-4">
          <button onClick={() => handleDelete(feedbackDetails.id)} className="hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black p-0.5 cursor-pointer">delete</button>
          <Link href="#" className="hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black p-0.5">details</Link>
        </div>
        <div className="flex flex-row items-center space-x-4 sm:hidden">
          {feedbackDetails.feedback_content&&<p className="text-sm font-bold">{feedbackDetails.rating}/10</p>}
          <div className="max-w-28 truncate">
            <TimeAgo date={feedbackDetails.created_at} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default FeedbacksPage