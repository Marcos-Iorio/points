import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "lucide-react";

interface PlanTypeProps {
  clubId: string;
}

const PlanType = async ({ clubId }: PlanTypeProps) => {
  const supabase = await createClient();

  const { data: supportData, error } = await supabase
    .from("support_plans")
    .select("plan_type")
    .eq("club_id", clubId);

  return <p>asda</p>;
};

export default PlanType;
