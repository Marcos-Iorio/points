import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Scoreboard } from "@/components/match/scoreboard";
import type { MatchConfiguration } from "@/app/actions/match";

const MatchPage = async ({
  params,
}: {
  params: Promise<{ id: string; courtNumber: string }>;
}) => {
  const { id, courtNumber } = await params;
  const supabase = await createClient();

  const { data: courtData, error: courtError } = await supabase
    .from("courts")
    .select("id, name")
    .eq("club_id", id)
    .eq("name", courtNumber)
    .single();

  console.log("courtData:", courtData, "courtError:", courtError);

  if (!courtData) {
    notFound();
  }

  const { data: matchConfig, error: matchError } = await supabase
    .from("court_configurations")
    .select("*")
    .eq("court_id", courtData.id)
    .order("match_start", { ascending: false })
    .limit(1)
    .single();

  console.log("matchConfig:", matchConfig, "matchError:", matchError);

  if (!matchConfig) {
    notFound();
  }

  const configuration = matchConfig.configuration as MatchConfiguration & {
    score?: {
      team1Sets: number;
      team2Sets: number;
      currentSet: {
        team1Points: number;
        team2Points: number;
      };
    };
  };

  return (
    <Scoreboard
      configId={matchConfig.id}
      configuration={configuration}
      initialScore={configuration.score}
    />
  );
};

export default MatchPage;
