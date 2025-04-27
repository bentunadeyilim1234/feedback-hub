/* eslint-disable  @typescript-eslint/no-explicit-any */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from "next/server"
import { tasks } from '@trigger.dev/sdk/v3'

//ping

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
  const { client_secret, place_id } : { client_secret: string, place_id: number } = await req.json()
  const user_id = Buffer.from(client_secret, 'base64').toString('utf8')
  const { data, error } = await supabase.auth.admin.getUserById(user_id)
  if(!data.user || error) { return new Response(JSON.stringify({ success: false, error: "secret key is invalid." }), { status: 200 }) }
  const fetch_data = await supabase
  .from('games')
  .select('id')
  .limit(1)
  .eq('place_id', place_id)
  .eq('owner', user_id)
  if (fetch_data.data && fetch_data.data.length > 0){ //place exists
    await tasks.trigger('update-game-details', { id: fetch_data.data[0].id })
    return new Response(JSON.stringify({success: true, data: 'checked'}), {
      status: 200
    })
  }
  const response = await rbxRequest("GET", "https://games.roblox.com/v1/games/multiget-place-details?placeIds="+place_id)
  if(!response || response.length <= 0) { return new Response(JSON.stringify({ success: false, error: "could not get place details" }), { status: 200 }) }
  const created_game_record = await supabase
  .from('games')
  .insert({
    'owner': user_id,
    'place_id': place_id,
    'universe_id': response[0].universeId,
    'game_title': response[0].name
  }).select()
  if(created_game_record.status == 201 && created_game_record.data && created_game_record.data.length > 0) {
    await tasks.trigger('update-game-details', { id: created_game_record.data[0].id })
    return new Response(JSON.stringify({ success: true, data: 'created' }), { status: 200 })
  }
  return new Response(JSON.stringify({success: false, error: "there was a db error", data: created_game_record.error}), {
    status: 200
  })
}