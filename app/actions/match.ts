"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type MatchConfiguration = {
  team1Name: string;
  team2Name: string;
  sets: number;
  goldenPoint: boolean;
};

export async function createMatchConfiguration(
  courtId: string,
  configuration: MatchConfiguration
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("court_configurations")
    .insert({
      court_id: courtId,
      configuration: configuration as any,
      match_status: "playing",
      match_start: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating match configuration:", error);
    throw new Error("Failed to create match configuration");
  }

  revalidatePath(`/court/${courtId}/match`);
  return data;
}

export async function getMatchConfiguration(courtId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("court_configurations")
    .select("*")
    .eq("court_id", courtId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching match configuration:", error);
    return null;
  }

  return data;
}

export async function updateMatchScore(
  configId: string,
  score: {
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
  }
) {
  const supabase = await createClient();

  const { data: currentConfig } = await supabase
    .from("court_configurations")
    .select("configuration")
    .eq("id", configId)
    .single();

  if (!currentConfig) {
    throw new Error("Match configuration not found");
  }

  const updatedConfig = {
    ...(currentConfig.configuration as any),
    score,
  };

  const { data, error } = await supabase
    .from("court_configurations")
    .update({
      configuration: updatedConfig as any,
    })
    .eq("id", configId)
    .select()
    .single();

  if (error) {
    console.error("Error updating match score:", error);
    throw new Error("Failed to update match score");
  }

  return data;
}

export async function endMatch(configId: string, winner?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("court_configurations")
    .update({
      match_status: "completed",
      match_end: new Date().toISOString(),
    })
    .eq("id", configId)
    .select()
    .single();

  if (error) {
    console.error("Error ending match:", error);
    throw new Error("Failed to end match");
  }

  revalidatePath(`/match`);
  return data;
}
