"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { updateMatchScore, endMatch } from "@/app/actions/match";
import type { MatchConfiguration } from "@/app/actions/match";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ScoreboardProps {
  configId: string;
  configuration: MatchConfiguration;
  initialScore?: {
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
}

// Convertir puntos numéricos a puntos de pádel
const getPadelScore = (
  points: number,
  opponentPoints: number,
  goldenPoint: boolean
) => {
  if (points === 0) return "0";
  if (points === 1) return "15";
  if (points === 2) return "30";
  if (points === 3) {
    if (opponentPoints < 3) return "40";
    if (goldenPoint) return "40";
    if (points === opponentPoints) return "40";
    if (points > opponentPoints) return "AD";
  }
  if (points > 3) {
    if (goldenPoint) return "JGO";
    if (points > opponentPoints) return "AD";
    return "40";
  }
  return "0";
};

export function Scoreboard({
  configId,
  configuration,
  initialScore,
}: ScoreboardProps) {
  const router = useRouter();
  const [score, setScore] = useState(
    initialScore || {
      team1Sets: 0,
      team2Sets: 0,
      setsHistory: [],
      currentSet: {
        team1Games: 0,
        team2Games: 0,
        team1Points: 0,
        team2Points: 0,
      },
      server: "team1" as "team1" | "team2",
    }
  );

  const [matchWinner, setMatchWinner] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);

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
      // Finalizar partido automáticamente
      handleEndMatch(configuration.team1Name);
    } else if (score.team2Sets === setsToWin) {
      setMatchWinner(configuration.team2Name);
      // Finalizar partido automáticamente
      handleEndMatch(configuration.team2Name);
    }
  }, [score, configuration]);

  const checkGameWon = (
    team1Pts: number,
    team2Pts: number
  ): "team1" | "team2" | null => {
    if (configuration.goldenPoint) {
      if (team1Pts === 4) return "team1";
      if (team2Pts === 4) return "team2";
    } else {
      if (team1Pts >= 4 && team1Pts - team2Pts >= 2) return "team1";
      if (team2Pts >= 4 && team2Pts - team1Pts >= 2) return "team2";
    }
    return null;
  };

  const checkSetWon = (
    team1Games: number,
    team2Games: number
  ): "team1" | "team2" | null => {
    if (team1Games === 6 && team2Games < 5) return "team1";
    if (team2Games === 6 && team1Games < 5) return "team2";
    if (team1Games === 7 && team2Games === 5) return "team1";
    if (team2Games === 7 && team1Games === 5) return "team2";
    if (team1Games === 7 && team2Games === 6) return "team1";
    if (team2Games === 7 && team1Games === 6) return "team2";
    return null;
  };

  const shouldChangeServer = (oldGames: number, newGames: number): boolean => {
    // El saque cambia cada juego impar (1, 3, 5, 7...)
    return oldGames !== newGames;
  };

  const addPoint = async (team: "team1" | "team2") => {
    if (matchWinner) return;

    const newScore = { ...score };
    const currentSet = { ...newScore.currentSet };
    const oldTotalGames = currentSet.team1Games + currentSet.team2Games;

    if (team === "team1") {
      currentSet.team1Points++;
    } else {
      currentSet.team2Points++;
    }

    const gameWinner = checkGameWon(
      currentSet.team1Points,
      currentSet.team2Points
    );

    if (gameWinner) {
      // Juego ganado
      if (gameWinner === "team1") {
        currentSet.team1Games++;
      } else {
        currentSet.team2Games++;
      }
      currentSet.team1Points = 0;
      currentSet.team2Points = 0;

      // Cambiar servidor
      const newTotalGames = currentSet.team1Games + currentSet.team2Games;
      if (shouldChangeServer(oldTotalGames, newTotalGames)) {
        newScore.server = newScore.server === "team1" ? "team2" : "team1";
      }

      const setWinner = checkSetWon(
        currentSet.team1Games,
        currentSet.team2Games
      );

      if (setWinner) {
        // Set ganado
        newScore.setsHistory.push({
          team1Games: currentSet.team1Games,
          team2Games: currentSet.team2Games,
        });

        if (setWinner === "team1") {
          newScore.team1Sets++;
        } else {
          newScore.team2Sets++;
        }

        currentSet.team1Games = 0;
        currentSet.team2Games = 0;
      }
    }

    newScore.currentSet = currentSet;
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

  const toggleServer = async () => {
    if (matchWinner) return;
    const newScore = { ...score };
    newScore.server = newScore.server === "team1" ? "team2" : "team1";
    setScore(newScore);
    await updateMatchScore(configId, newScore);
  };

  const handleEndMatch = async (winner?: string) => {
    if (isEnding) return; // Evitar llamadas múltiples
    setIsEnding(true);
    try {
      await endMatch(configId, winner);
    } catch (error) {
      console.error("Error ending match:", error);
      setIsEnding(false);
    }
  };

  const team1Score = getPadelScore(
    score.currentSet.team1Points,
    score.currentSet.team2Points,
    configuration.goldenPoint
  );
  const team2Score = getPadelScore(
    score.currentSet.team2Points,
    score.currentSet.team1Points,
    configuration.goldenPoint
  );

  const maxSets = Math.ceil(configuration.sets / 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white/10 backdrop-blur-md rounded-full px-6 py-3 mb-4">
            <span className="text-white text-lg font-medium">
              Mejor de {configuration.sets} sets
              {configuration.goldenPoint
                ? " · Punto de Oro"
                : " · Sin Punto de Oro"}
            </span>
          </div>
        </div>

        {matchWinner && (
          <div className="mb-8 p-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl text-center shadow-2xl animate-pulse">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              ¡{matchWinner} GANÓ EL PARTIDO!
            </h2>
            <p className="text-white/80 mt-4 text-lg">
              El partido ha finalizado automáticamente
            </p>
          </div>
        )}

        {/* Marcador Principal - Estilo Tabla */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl mb-8">
          {/* Header de la tabla */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 items-center text-white font-bold text-sm md:text-base">
              <div className="col-span-1"></div>
              <div className="col-span-4 md:col-span-3">JUGADOR/EQUIPO</div>
              <div className="col-span-1 text-center">SETS</div>
              {score.setsHistory.map((_, i) => (
                <div key={i} className="col-span-1 text-center hidden md:block">
                  S{i + 1}
                </div>
              ))}
              {/* Set actual si hay juegos */}
              {(score.currentSet.team1Games > 0 ||
                score.currentSet.team2Games > 0) && (
                <div className="col-span-1 text-center text-yellow-300">
                  ACTUAL
                </div>
              )}
              <div className="col-span-2 text-center text-xl">PUNTOS</div>
            </div>
          </div>

          {/* Fila Equipo 1 */}
          <div
            className={`px-6 py-6 border-b border-white/10 transition-all ${
              score.currentSet.team1Points > score.currentSet.team2Points &&
              !matchWinner
                ? "bg-blue-500/20"
                : "bg-white/5"
            }`}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Indicador de saque */}
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={toggleServer}
                  disabled={!!matchWinner}
                  className="transition-all"
                >
                  {score.server === "team1" ? (
                    <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 animate-pulse"></div>
                  ) : (
                    <div className="w-4 h-4 bg-transparent rounded-full border-2 border-white/20"></div>
                  )}
                </button>
              </div>

              {/* Nombre del equipo */}
              <div className="col-span-4 md:col-span-3">
                <h3 className="text-xl md:text-2xl font-bold text-white truncate">
                  {configuration.team1Name}
                </h3>
              </div>

              {/* Sets ganados */}
              <div className="col-span-1 text-center">
                <div className="text-3xl font-bold text-white">
                  {score.team1Sets}
                </div>
                <div className="flex justify-center gap-1 mt-1">
                  {Array.from({ length: maxSets }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < score.team1Sets ? "bg-yellow-400" : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Historial de sets */}
              {score.setsHistory.map((set, i) => (
                <div key={i} className="col-span-1 text-center hidden md:block">
                  <div className="text-2xl font-bold text-white/80">
                    {set.team1Games}
                  </div>
                </div>
              ))}

              {/* Set actual */}
              {(score.currentSet.team1Games > 0 ||
                score.currentSet.team2Games > 0) && (
                <div className="col-span-1 text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {score.currentSet.team1Games}
                  </div>
                </div>
              )}

              {/* Puntos del juego actual */}
              <div className="col-span-2 text-center">
                <div className="text-5xl md:text-6xl font-bold text-white">
                  {team1Score}
                </div>
              </div>
            </div>
          </div>

          {/* Fila Equipo 2 */}
          <div
            className={`px-6 py-6 transition-all ${
              score.currentSet.team2Points > score.currentSet.team1Points &&
              !matchWinner
                ? "bg-red-500/20"
                : "bg-white/5"
            }`}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Indicador de saque */}
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={toggleServer}
                  disabled={!!matchWinner}
                  className="transition-all"
                >
                  {score.server === "team2" ? (
                    <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 animate-pulse"></div>
                  ) : (
                    <div className="w-4 h-4 bg-transparent rounded-full border-2 border-white/20"></div>
                  )}
                </button>
              </div>

              {/* Nombre del equipo */}
              <div className="col-span-4 md:col-span-3">
                <h3 className="text-xl md:text-2xl font-bold text-white truncate">
                  {configuration.team2Name}
                </h3>
              </div>

              {/* Sets ganados */}
              <div className="col-span-1 text-center">
                <div className="text-3xl font-bold text-white">
                  {score.team2Sets}
                </div>
                <div className="flex justify-center gap-1 mt-1">
                  {Array.from({ length: maxSets }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < score.team2Sets ? "bg-yellow-400" : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {score.setsHistory.map((set, i) => (
                <div key={i} className="col-span-1 text-center hidden md:block">
                  <div className="text-2xl font-bold text-white/80">
                    {set.team2Games}
                  </div>
                </div>
              ))}

              {(score.currentSet.team1Games > 0 ||
                score.currentSet.team2Games > 0) && (
                <div className="col-span-1 text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {score.currentSet.team2Games}
                  </div>
                </div>
              )}

              <div className="col-span-2 text-center">
                <div className="text-5xl md:text-6xl font-bold text-white">
                  {team2Score}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controles Equipo 1 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
            <h4 className="text-white font-bold text-xl mb-4 text-center">
              {configuration.team1Name}
            </h4>
            <div className="flex gap-3">
              <Button
                onClick={() => addPoint("team1")}
                className="flex-1 h-16 text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-lg"
                disabled={!!matchWinner}
              >
                + Punto
              </Button>
              <Button
                onClick={() => subtractPoint("team1")}
                variant="outline"
                className="h-16 px-6 bg-white/10 border-white/30 text-white hover:bg-white/20"
                disabled={!!matchWinner}
              >
                −
              </Button>
            </div>
          </div>

          {/* Controles Equipo 2 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
            <h4 className="text-white font-bold text-xl mb-4 text-center">
              {configuration.team2Name}
            </h4>
            <div className="flex gap-3">
              <Button
                onClick={() => addPoint("team2")}
                className="flex-1 h-16 text-xl font-bold bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-lg"
                disabled={!!matchWinner}
              >
                + Punto
              </Button>
              <Button
                onClick={() => subtractPoint("team2")}
                variant="outline"
                className="h-16 px-6 bg-white/10 border-white/30 text-white hover:bg-white/20"
                disabled={!!matchWinner}
              >
                −
              </Button>
            </div>
          </div>
        </div>

        {/* Botones de control */}
        <div className="mt-6 flex flex-col md:flex-row gap-4 justify-center items-center">
          <Button
            onClick={toggleServer}
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            disabled={!!matchWinner}
          >
            🎾 Cambiar Saque Manualmente
          </Button>

          {!matchWinner && (
            <Button
              onClick={() => handleEndMatch()}
              variant="outline"
              className="bg-red-500/20 border-red-500/50 text-white hover:bg-red-500/30"
              disabled={isEnding}
            >
              {isEnding ? "Finalizando..." : "⏹️ Finalizar Partido"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
