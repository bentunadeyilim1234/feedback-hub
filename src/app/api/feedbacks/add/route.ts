/* eslint-disable  @typescript-eslint/no-explicit-any */

import { createClient } from '@supabase/supabase-js'
import { tasks } from '@trigger.dev/sdk/v3';
import { NextRequest } from "next/server"

type FeedbackPayload = {
  author_id: number;
  author_displayname: string | null;
  author_avatar_url: string;
  author_username: string;
  rating: number;
  feedback_content: string;
}

const rbxRequest = async (verb: string, url: string, body?: any | undefined) => {
  const response = await fetch(url, {
    headers: {
      Cookie: `.ROBLOSECURITY=${process.env.ROBLOX_API!};`,
      "Content-Length": body?.length.toString() || "0"
    },
    method: verb
  })

  return response.json()
}

export async function POST(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PRIVATE_SUPABASE_SERVICE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  const { client_secret, place_id, payload } : { client_secret: string, place_id: number, payload: FeedbackPayload } = await req.json()
  const user_id = Buffer.from(client_secret, 'base64').toString('utf8')
  const { data, error } = await supabase.auth.admin.getUserById(user_id)
  if(!data.user || error) { return new Response(JSON.stringify({ success: false, error: "secret key is invalid." }), { status: 200 }) }
  const avatarResponse = await rbxRequest("GET", `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${payload.author_id}&size=48x48&format=Png&isCircular=true`)
  if(!avatarResponse || avatarResponse.length <= 0) { return new Response(JSON.stringify({ success: false, error: "could not get user avatar." }), { status: 200 }) }
  const insert_data = await supabase
  .from('feedbacks')
  .insert({
    'place_id': place_id,
    'author_id': payload.author_id,
    'author_displayname': payload.author_displayname || null,
    'author_avatar_url': avatarResponse.data[0].imageUrl,
    'author_username': payload.author_username,
    'rating': payload.rating,
    'feedback_content': payload.feedback_content,
    'game_owner': data.user.id
  })
  .select('id')
  if (!insert_data.data || insert_data.data.length <= 0 || !("id" in insert_data.data[0]) || error){
    return new Response(JSON.stringify({ success: false, error: "could not insert" }), { status: 200 })
  }
  await tasks.trigger('update-avatar-url', { feedback_id: insert_data.data[0].id })
  if (insert_data.status !== 201){
    return new Response(JSON.stringify({success: false, error: 'error whilst submit, try again'}), {
      status: 200
    })
  }
  return new Response(JSON.stringify({ success: true, data: 'created' }), { status: 200 })
}