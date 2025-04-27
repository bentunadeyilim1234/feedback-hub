import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { auth } from "@trigger.dev/sdk/v3";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const triggerToken = await auth.createTriggerPublicToken("generate-script");
    return NextResponse.json({ success: true, data: triggerToken });
  } catch (error) {
    console.error("Error creating trigger token:", error);
    return NextResponse.json({ success: false, error: "Failed to create token" }, { status: 500 });
  }
}