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

  if (!matchConfig) {
    notFound();
  }

  const configuration = matchConfig.configuration as MatchConfiguration & {
    score?: {
      team1Sets: number;
      team2Sets: number;
      setsHistory: Array<{ team1Games: number; team2Games: number }>;
      currentSet: {
        team1Games: number;
        team2Games: number;
        team1Points: number;
        team2Points: number;
      };
      server: "team1" | "team2";
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
