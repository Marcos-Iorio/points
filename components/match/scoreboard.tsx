"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { updateMatchScore } from "@/app/actions/match";
import type { MatchConfiguration } from "@/app/actions/match";
import { createClient } from "@/lib/supabase/client";

interface ScoreboardProps {
  configId: string;
  configuration: MatchConfiguration;
  initialScore?: {
    team1Sets: number;
    team2Sets: number;
    currentSet: {
      team1Points: number;
      team2Points: number;
    };
  };
}

export function Scoreboard({
  configId,
  configuration,
  initialScore,
}: ScoreboardProps) {
  const [score, setScore] = useState(
    initialScore || {
      team1Sets: 0,
      team2Sets: 0,
      currentSet: {
        team1Points: 0,
        team2Points: 0,
      },
    }
  );

  const [matchWinner, setMatchWinner] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`match-${configId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "court_configurations",
          filter: `id=eq.${configId}`,
        },
        (payload) => {
          console.log("Score updated!", payload);
          const newConfig = payload.new as any;
          if (newConfig.configuration?.score) {
            setScore(newConfig.configuration.score);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [configId]);

  useEffect(() => {
    const setsToWin = Math.ceil(configuration.sets / 2);
    if (score.team1Sets === setsToWin) {
      setMatchWinner(configuration.team1Name);
    } else if (score.team2Sets === setsToWin) {
      setMatchWinner(configuration.team2Name);
    }
  }, [score, configuration]);

  const addPoint = async (team: "team1" | "team2") => {
    if (matchWinner) return;

    const newScore = { ...score };
    const pointsKey = team === "team1" ? "team1Points" : "team2Points";
    newScore.currentSet[pointsKey]++;

    const team1Points = newScore.currentSet.team1Points;
    const team2Points = newScore.currentSet.team2Points;

    if (
      (team1Points >= configuration.pointsToWin &&
        team1Points - team2Points >= 2) ||
      (team2Points >= configuration.pointsToWin &&
        team2Points - team1Points >= 2)
    ) {
      if (team1Points > team2Points) {
        newScore.team1Sets++;
      } else {
        newScore.team2Sets++;
      }
      newScore.currentSet = { team1Points: 0, team2Points: 0 };
    }

    setScore(newScore);
    await updateMatchScore(configId, newScore);
  };

  const subtractPoint = async (team: "team1" | "team2") => {
    if (matchWinner) return;

    const newScore = { ...score };
    const pointsKey = team === "team1" ? "team1Points" : "team2Points";

    if (newScore.currentSet[pointsKey] > 0) {
      newScore.currentSet[pointsKey]--;
      setScore(newScore);
      await updateMatchScore(configId, newScore);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {matchWinner && (
          <div className="mb-6 p-6 bg-accent-primary rounded-lg text-center">
            <h2 className="text-3xl font-bold text-white">
              🏆 ¡{matchWinner} ganó el partido!
            </h2>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-card p-8 rounded-lg shadow-lg border-4 border-primary/20">
            <div className="text-center mb-4">
              <h3 className="text-3xl font-bold text-text-primary mb-2">
                {configuration.team1Name}
              </h3>
              <div className="text-sm text-text-secondary">
                Sets: {score.team1Sets}
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="text-8xl font-bold text-primary">
                {score.currentSet.team1Points}
              </div>
              <div className="text-sm text-text-secondary mt-2">Puntos</div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => addPoint("team1")}
                className="flex-1 h-16 text-xl"
                disabled={!!matchWinner}
              >
                + Punto
              </Button>
              <Button
                onClick={() => subtractPoint("team1")}
                variant="outline"
                className="h-16 px-6"
                disabled={!!matchWinner}
              >
                -
              </Button>
            </div>
          </div>

          <div className="bg-card p-8 rounded-lg shadow-lg border-4 border-secondary/20">
            <div className="text-center mb-4">
              <h3 className="text-3xl font-bold text-text-primary mb-2">
                {configuration.team2Name}
              </h3>
              <div className="text-sm text-text-secondary">
                Sets: {score.team2Sets}
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="text-8xl font-bold text-secondary">
                {score.currentSet.team2Points}
              </div>
              <div className="text-sm text-text-secondary mt-2">Puntos</div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => addPoint("team2")}
                className="flex-1 h-16 text-xl"
                disabled={!!matchWinner}
              >
                + Punto
              </Button>
              <Button
                onClick={() => subtractPoint("team2")}
                variant="outline"
                className="h-16 px-6"
                disabled={!!matchWinner}
              >
                -
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold mb-3">
            Configuración del Partido
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-text-secondary">Modo</div>
              <div className="font-medium">
                {configuration.gameMode === "single" ? "Individual" : "Dobles"}
              </div>
            </div>
            <div>
              <div className="text-sm text-text-secondary">Sets</div>
              <div className="font-medium">Mejor de {configuration.sets}</div>
            </div>
            <div>
              <div className="text-sm text-text-secondary">Puntos por Set</div>
              <div className="font-medium">{configuration.pointsToWin}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
