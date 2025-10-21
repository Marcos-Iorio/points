import ClubOnboardingForm from "@/components/onboarding/club-onboarding-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"

export default async function ClubOnboardingPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Verificar si ya tiene un club
  const { data: existingClub } = await supabase
    .from('clubs')
    .select('id, name')
    .eq('auth_user_id', user.id)
    .single()

  if (existingClub) {
    redirect(`/club/${existingClub.id}/admin`)
  }

  return (
    <div className="flex min-h-screen bg-[#121A3F] flex-col items-center justify-center py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <ClubOnboardingForm userId={user.id} />
      </div>
    </div>
  )
}
