import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient({ canSetCookies: true })
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(requestUrl.origin + "/login?error=Unable to verify email")
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: clubs } = await supabase
        .from('clubs')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      // Si no tiene club, redirigir a onboarding
      if (!clubs) {
        return NextResponse.redirect(requestUrl.origin + "/club/onboarding")
      }
    }
  }

  // Si ya tiene club, ir al dashboard
  return NextResponse.redirect(requestUrl.origin + "/")
}
