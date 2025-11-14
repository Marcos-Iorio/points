import { createClient } from "@/lib/supabase/server";
import type { Plan, ClubSubscription } from "@/types/subscription";

export interface PlanLimits {
  maxCourts: number | null; // null = ilimitado
  maxUsers: number | null; // null = ilimitado
  currentCourts: number;
  currentUsers: number;
  canAddCourt: boolean;
  canAddUser: boolean;
}

/**
 * Obtiene los límites del plan de un club y el uso actual
 */
export async function getClubPlanLimits(clubId: string): Promise<PlanLimits | null> {
  const supabase = await createClient();

  // Obtener suscripción con plan
  const { data: subscription } = await supabase
    .from("club_subscriptions")
    .select(`
      *,
      plan:plans(*)
    `)
    .eq("club_id", clubId)
    .eq("status", "active")
    .maybeSingle();

  if (!subscription || !subscription.plan) {
    return null;
  }

  const plan = subscription.plan as Plan;

  // Contar canchas actuales del club
  const { count: courtsCount } = await supabase
    .from("courts")
    .select("*", { count: "exact", head: true })
    .eq("club_id", clubId);

  // Contar usuarios actuales del club (asumiendo que existe una relación)
  // Ajusta esta query según tu estructura de usuarios
  const { count: usersCount } = await supabase
    .from("club_members")
    .select("*", { count: "exact", head: true })
    .eq("club_id", clubId);

  const currentCourts = courtsCount || 0;
  const currentUsers = usersCount || 0;

  return {
    maxCourts: plan.max_courts,
    maxUsers: plan.max_users,
    currentCourts,
    currentUsers,
    canAddCourt: plan.max_courts === null || currentCourts < plan.max_courts,
    canAddUser: plan.max_users === null || currentUsers < plan.max_users,
  };
}

/**
 * Valida si un club puede agregar una nueva cancha
 */
export async function canClubAddCourt(clubId: string): Promise<boolean> {
  const limits = await getClubPlanLimits(clubId);
  return limits?.canAddCourt ?? false;
}

/**
 * Valida si un club puede agregar un nuevo usuario
 */
export async function canClubAddUser(clubId: string): Promise<boolean> {
  const limits = await getClubPlanLimits(clubId);
  return limits?.canAddUser ?? false;
}

/**
 * Obtiene el plan activo de un club
 */
export async function getActiveClubPlan(clubId: string): Promise<Plan | null> {
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("club_subscriptions")
    .select(`
      *,
      plan:plans(*)
    `)
    .eq("club_id", clubId)
    .eq("status", "active")
    .maybeSingle();

  return subscription?.plan as Plan || null;
}

/**
 * Verifica si un club tiene un plan activo
 */
export async function hasActivePlan(clubId: string): Promise<boolean> {
  const plan = await getActiveClubPlan(clubId);
  return plan !== null && plan.active === true;
}
