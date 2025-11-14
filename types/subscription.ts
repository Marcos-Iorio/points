export type PlanType = 'basic' | 'premium';

export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due' | 'pending';

export interface Plan {
  id: string;
  name: string;
  plan_type: PlanType;
  description: string | null;
  price: number;
  max_courts: number | null; // null = ilimitado
  max_users: number | null; // null = ilimitado
  features: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClubSubscription {
  id: string;
  club_id: string;
  plan_id: string;
  plan_type?: PlanType; // Deprecated: usar plan.plan_type
  status: SubscriptionStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;

  // Relaciones
  plan?: Plan;
}

export interface ClubWithSubscription {
  id: string;
  name: string;
  subscription: ClubSubscription & { plan: Plan };
}
