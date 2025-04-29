import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

type Params = Promise<{ feedbackId: string }>;

export async function GET(
  request: Request,
  { params } : { params: Params } ) {

  const supabase = await createClient();
  const { feedbackId } = await params

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const delete_data = await supabase
  .from('feedbacks')
  .delete()
  .eq('id', Number(feedbackId))
  .select()

  if (delete_data.error || delete_data.status !== 200) {
    return NextResponse.json({ success: false, error: delete_data.error });
  }

  return NextResponse.json({ success: true });
}