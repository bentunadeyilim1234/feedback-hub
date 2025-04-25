import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (code) {
    const supabase  = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(`/`, request.url))
    }
  }

  return NextResponse.redirect(
    new URL(`/auth/login?error=${encodeURIComponent(
      'there was an error...'
    )}`, request.url)
  )
}