import { createClient } from '@supabase/supabase-js'
import { tasks } from '@trigger.dev/sdk/v3';
import { NextRequest } from "next/server"

type FeedbackPayload = {
  author_id: number;
  author_displayname: string | null;
  author_username: string;
  rating: number;
  feedback_content: string;
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
  const insert_data = await supabase
  .from('feedbacks')
  .insert({
    'place_id': place_id,
    'author_id': payload.author_id,
    'author_displayname': payload.author_displayname || null,
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