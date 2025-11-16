"use client";

import { Plan } from "@/types/subscription";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface SelectPlanProps {
  setSelectedPlan: Dispatch<SetStateAction<Plan | null>>;
}

const SelectPlan = ({ setSelectedPlan }: SelectPlanProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from("plans")
        .select()
        .eq("active", true);

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
      {plans.map((plan: Plan) => (
        <article
          key={plan.id}
          onClick={() => setSelectedPlan(plan)}
          className="cursor-pointer"
        >
          {plan.name}
        </article>
      ))}
    </>
  );
};

export default SelectPlan;
