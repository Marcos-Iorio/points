"use client";

import { Plan } from "@/types/subscription";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface SelectPlanProps {
  setSelectedPlan: Dispatch<SetStateAction<Plan | null>>;
  selectedPlan: Plan | null;
}

const SelectPlan = ({ setSelectedPlan, selectedPlan }: SelectPlanProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase.from("plans").select().eq("active", true);

      if (data) {
        setPlans(data);
      }
      setLoading(false);
    };

    fetchPlans();
  }, []);

  if (loading) {
    return <div>Cargando planes...</div>;
  }

  return (
    <>
      <h2 className="font-bold text-2xl">
        Elegí el plan de soporte que más te convenga
      </h2>
      <div className="flex flex-row justify-center gap-3">
        {plans.map((plan: Plan) => (
          <article
            key={plan.id}
            onClick={() => setSelectedPlan(plan)}
            className={`cursor-pointer w-1/2 text-center  rounded-xl p-5 text-text-primary relative shadow-soft ${
              selectedPlan?.name === plan.name ? "bg-accent-secondary/40" : null
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
