/* eslint-disable  @typescript-eslint/no-explicit-any */

import { createClient } from "@supabase/supabase-js";
import { task } from "@trigger.dev/sdk/v3";
import { Database } from "@/../database.types";

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

export const updateGameDetails = task({
  id: "update-avatar-url",
  run: async (payload: { feedback_id: number }) => {
    const { feedback_id } = payload;

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
    .from('feedbacks')
    .select()
    .eq('id', feedback_id)

    if (!data || data.length <= 0){
      throw new Error(`could not find specified feedback for row id: ${feedback_id}`)
    }
    if (error) {
      throw new Error(`failed to retrieve feedback for row id: ${feedback_id}`);
    }

    const avatarResponse = await rbxRequest("GET", `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${data[0].author_id}&size=48x48&format=Png&isCircular=true`)
    if(!avatarResponse || avatarResponse.length <= 0) { throw new Error(`could not retrieve avatar for user id: ${data[0].author_id}`) }

    await supabase
    .from('feedbacks')
    .update({
      'author_avatar_url': avatarResponse.data[0].imageUrl
    })
    .eq('id', feedback_id)
    return {
      message: `update successful for: ${feedback_id}`,
    };
  },
});