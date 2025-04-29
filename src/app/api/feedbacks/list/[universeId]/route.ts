import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params } : { params: { universeId: string } } ) {

  const supabase = await createClient();
  const { universeId } = await params

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
  .eq('universe_id', Number(universeId))
  .limit(1)

  if (game_data.error || !game_data.data || game_data.data.length <= 0 || !("place_id" in game_data.data[0])) {
    return NextResponse.json({ success: false, error: game_data.error });
  }

  const { data } = await supabase
  .from('feedbacks')
  .select('id, created_at, author_id, author_displayname, author_username, rating, feedback_content, author_avatar_url')
  .eq('place_id', game_data.data[0].place_id)
  .order('created_at', { ascending: false })

  const analytics = await supabase
  .from('feedbacks')
  .select('rating.avg()')
  .eq('place_id', game_data.data[0].place_id)

  if (analytics.error || !analytics.data || analytics.data.length <= 0) {
    return NextResponse.json({ success: false, error: analytics.error });
  }

  return NextResponse.json({ success: true, game_details: game_data.data[0], feedbacks: data, analytics: analytics.data[0] });
}