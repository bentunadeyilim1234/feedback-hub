import { createClient } from "@supabase/supabase-js";
import { task } from "@trigger.dev/sdk/v3";
import { Database } from "@/../database.types";

let xCrsfToken: string | null = ""

const rbxRequest = async (verb: string, url: string, body?: any | undefined) => {
  const response = await fetch(url, {
    headers: {
      Cookie: `.ROBLOSECURITY=${process.env.ROBLOX_API!};`,
      "Content-Length": body?.length.toString() || "0"
    },
    method: verb
  })

  if (response.status == 403) {
    if (response.headers.has("x-csrf-token")) {
      xCrsfToken = response.headers.get("x-csrf-token")
      return rbxRequest(verb, url, body)
    }
  }

  return response.json()
}

export const updateGameDetails = task({
  id: "update-game-details",
  run: async (payload: { id: number }) => {
    const { id } = payload;

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PRIVATE_SUPABASE_SERVICE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data, error } = await supabase
    .from('games')
    .select('universe_id')
    .limit(1)
    .eq('id', id)

    if (!data || data[0].universe_id == undefined){
      throw new Error(`could not find specified game for row id: ${id}`)
    }
    if (error) {
      throw new Error(`failed to retrieve game for row id: ${id}`);
    }

    const universeId = data[0].universe_id

    const thumbnailResponse = await rbxRequest("GET", `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&size=480x270&format=Png`)
    if(!thumbnailResponse || thumbnailResponse.length <= 0) { throw new Error(`could not retrieve thumbnail for universe id: ${universeId}`) }
    const gameIconResponse = await rbxRequest("GET", `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=128x128&format=Png`)
    if(!gameIconResponse || gameIconResponse.length <= 0) { throw new Error(`could not retrieve game icon for universe id: ${universeId}`) }
    await supabase
    .from('games')
    .update({
      'game_cover_url': thumbnailResponse.data[0].thumbnails[0].imageUrl,
      'game_icon_url': gameIconResponse.data[0].imageUrl,
      'updated_at': new Date().toISOString(),
      'created': true
    })
    .eq('universe_id', universeId)
    return {
      message: `update successful for: ${universeId}`,
    };
  },
});