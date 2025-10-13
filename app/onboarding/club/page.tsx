import ClubOnboardingForm from "@/components/onboarding/club-onboarding-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ClubOnboardingPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Verificar si ya tiene un club
  const { data: existingClub } = await supabase
    .from('clubs')
    .select('id, name')
    .eq('auth_user_id', session.user.id)
    .single()

  if (existingClub) {
    redirect(`/club/${existingClub.id}/admin`)
  }

  return (
    <div className="flex min-h-screen bg-[#121A3F] flex-col items-center justify-center py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <ClubOnboardingForm userId={session.user.id} />
      </div>
    </div>
  )
}
