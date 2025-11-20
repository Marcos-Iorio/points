"use client";

import { Plan } from "@/types/subscription";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface SelectPlanProps {
  setSelectedPlan: Dispatch<SetStateAction<Plan | null>>;
  selectedPlan: Plan | null;
  error?: string | null;
}

interface CurrentSubscription {
  plan: Plan;
  clubName: string;
}

const SelectPlan = ({
  setSelectedPlan,
  selectedPlan,
  error,
}: SelectPlanProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] =
    useState<CurrentSubscription | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Obtener planes activos
      const { data: plansData } = await supabase
        .from("plans")
        .select()
        .eq("active", true);

      if (plansData) {
        setPlans(plansData);
      }

      // Verificar si el usuario está logueado y tiene un plan
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: clubData } = await supabase
          .from("clubs")
          .select(
            `
            id,
            name,
            club_subscriptions (
              id,
              status,
              plan:plans (*)
            )
          `
          )
          .eq("auth_user_id", user.id)
          .single();

        if (clubData?.club_subscriptions) {
          const subscription = clubData.club_subscriptions as unknown as {
            id: string;
            status: string;
            plan: Plan;
          };

          if (subscription.status === "active" && subscription.plan) {
            setCurrentSubscription({
              plan: subscription.plan,
              clubName: clubData.name,
            });
          }
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Cargando planes...</div>;
  }

  if (currentSubscription) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
        <p className="text-green-800 font-bold text-lg mb-2">
          Ya tenés un plan activo
        </p>
        <p className="text-green-700">
          Tu club{" "}
          <span className="font-semibold">{currentSubscription.clubName}</span>{" "}
          ya cuenta con el plan{" "}
          <span className="font-semibold">{currentSubscription.plan.name}</span>
          .
        </p>
        <p className="text-green-600 text-sm mt-2">
          No necesitás comprar un plan nuevo.
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="font-bold text-2xl">
        Elegí el plan de soporte que más te convenga
      </h2>
      {error && (
        <p className="text-red-500 text-sm font-medium text-center animate-pulse">
          {error}
        </p>
      )}
      <div
        className={`flex flex-row justify-center gap-3 ${
          error ? "ring-2 ring-red-500 rounded-xl p-1 animate-shake" : ""
        }`}
      >
        {plans.map((plan: Plan) => (
          <article
            key={plan.id}
            onClick={() => setSelectedPlan(plan)}
            className={`cursor-pointer w-1/2 text-center  rounded-xl p-5 text-text-primary relative shadow-soft transition-all ${
              selectedPlan?.name === plan.name ? "bg-accent-secondary/40" : ""
            }`}
          >
            <p className="text-lg font-bold">{plan.name}</p>
            <p className="text-md font-normal">{plan.description}</p>
            <p className="font-bold">
              ${plan.price}{" "}
              <span className="font-normal text-sm">mensuales</span>
            </p>

            <div className="border border-black rounded-full w-5 h-5 grid place-content-center absolute top-2 left-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  selectedPlan?.name === plan.name && "bg-black"
                }`}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
};

export default SelectPlan;
