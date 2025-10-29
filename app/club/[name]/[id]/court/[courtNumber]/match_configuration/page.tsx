import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { requireClub } from "@/lib/auth";
import { MatchConfigForm } from "@/components/match/match-config-form";

const MatchConfigurationPage = async ({
  params,
}: {
  params: Promise<{ id: string; courtNumber: string; name: string }>;
}) => {
  const { id, courtNumber, name } = await params;
  const supabase = await createClient();

  const { data: courtData, error } = await supabase
    .from("courts")
    .select("id, name")
    .eq("club_id", id)
    .eq("name", courtNumber)
    .single();

  const { club } = await requireClub();

  if (!courtData) {
    notFound();
  }

  // Verificar si ya hay un partido activo en esta cancha
  const { data: activeMatch } = await supabase
    .from("court_configurations")
    .select("id, match_start, configuration")
    .eq("court_id", courtData.id)
    .is("match_end", null)
    .in("match_status", ["playing", "paused"])
    .order("match_start", { ascending: false })
    .limit(1)
    .single();

  return (
    <MatchConfigForm
      courtId={courtData.id}
      courtNumber={courtData.name}
      clubName={club.name}
      clubId={club.id}
      activeMatch={activeMatch}
    />
  );
};

export default MatchConfigurationPage;
