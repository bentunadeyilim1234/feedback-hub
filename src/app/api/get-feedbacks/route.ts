import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { universe_id } : { universe_id: number } = await request.json()
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const game_data = await supabase
  .from('games')
  .select()
  .eq('universe_id', universe_id)
  .limit(1)

  if (game_data.error || !game_data.data || game_data.data.length <= 0 || !("place_id" in game_data.data[0])) {
    return NextResponse.json({ success: false, error: game_data.error });
  }

  const { data } = await supabase
  .from('feedbacks')
  .select('*')
  .eq('place_id', game_data.data[0].place_id)
  .order('created_at', { ascending: false })

  return NextResponse.json({ success: true, game_details: game_data.data[0], feedbacks: data });
}