import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

/**
 * Obtiene el usuario autenticado actual.
 * Si no hay usuario, redirige a la página de login.
 *
 * @returns El usuario autenticado
 *
 * @example
 * ```tsx
 * export default async function MyPage() {
 *   const user = await requireAuth()
 *   // user está garantizado aquí
 * }
 * ```
 */
export async function requireAuth(): Promise<User> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return user
}

/**
 * Obtiene el usuario actual sin redirigir.
 * Retorna null si no hay usuario autenticado.
 *
 * @returns El usuario autenticado o null
 *
 * @example
 * ```tsx
 * export default async function MyPage() {
 *   const user = await getCurrentUser()
 *   if (!user) {
 *     return <div>Por favor inicia sesión</div>
 *   }
 * }
 * ```
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

/**
 * Verifica que el usuario autenticado sea el dueño del club.
 * Si no lo es, redirige a la página de onboarding.
 *
 * @param clubId - El ID del club a verificar
 * @returns El usuario y el club
 *
 * @example
 * ```tsx
 * export default async function ClubPage({ params }: { params: Promise<{ id: string }> }) {
 *   const { id } = await params
 *   const { user, club } = await requireClubOwner(id)
 *   // user y club están garantizados aquí
 * }
 * ```
 */
export async function requireClubOwner(clubId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: club, error } = await supabase
    .from("clubs")
    .select("*")
    .match({
      id: clubId,
      auth_user_id: user.id,
    })
    .single()

  if (!club || error) {
    redirect("/club/onboarding")
  }

  return { user, club }
}

/**
 * Verifica que el usuario tenga un club registrado.
 * Si no tiene club, redirige a onboarding.
 *
 * @returns El usuario y su club
 *
 * @example
 * ```tsx
 * export default async function DashboardPage() {
 *   const { user, club } = await requireClub()
 *   // user y club están garantizados aquí
 * }
 * ```
 */
export async function requireClub() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: club, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("auth_user_id", user.id)
    .single()

  if (!club || error) {
    redirect("/club/onboarding")
  }

  return { user, club }
}
