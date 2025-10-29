"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createMatchConfiguration } from "@/app/actions/match";

interface MatchConfigFormProps {
  courtId: string;
  courtNumber: string;
  clubName: string;
  clubId: string;
  activeMatch?: {
    id: string;
    match_start: string | null;
    configuration: any;
  } | null;
}

export function MatchConfigForm({
  courtId,
  courtNumber,
  clubName,
  clubId,
  activeMatch,
}: MatchConfigFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [matchCreated, setMatchCreated] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    team1Name: "",
    team2Name: "",
    gameMode: "doubles" as "single" | "doubles",
    sets: 3,
    pointsToWin: 21,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createMatchConfiguration(courtId, formData);
      setMatchCreated(true);
    } catch (error) {
      console.error("Error creating match:", error);
      alert("Error al crear el partido. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (matchCreated) {
    return <h2>¡A jugar!</h2>;
  }

  // Si hay un partido activo, mostrar mensaje
  if (activeMatch) {
    const teamNames = activeMatch.configuration?.team1Name && activeMatch.configuration?.team2Name
      ? `${activeMatch.configuration.team1Name} vs ${activeMatch.configuration.team2Name}`
      : "Partido en curso";

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center">
          <div className="bg-card p-8 rounded-lg shadow-lg border-2 border-accent-primary">
            <div className="text-6xl mb-6">🎾</div>
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              Cancha en Uso
            </h1>
            <p className="text-xl text-text-secondary mb-6">
              La cancha {courtNumber} está actualmente ocupada
            </p>
            <div className="bg-accent-primary/10 p-6 rounded-lg mb-6">
              <p className="text-lg font-semibold text-text-primary mb-2">
                {teamNames}
              </p>
              {activeMatch.match_start && (
                <p className="text-sm text-text-secondary">
                  Partido iniciado: {new Date(activeMatch.match_start).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
            <Button
              onClick={() => router.push(`/${clubName}/${clubId}/court/${courtNumber}/match`)}
              className="w-full h-12 text-lg"
            >
              Ver Partido en Vivo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Configuración del Partido
          </h1>
          <p className="text-text-secondary text-lg">
            Cancha {courtNumber} - Configurá los detalles de tu partido
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card p-6 rounded-lg shadow-sm border space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Equipos</h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="team1"
                    className="block text-sm font-medium mb-2"
                  >
                    Nombre del Equipo 1
                  </label>
                  <Input
                    id="team1"
                    type="text"
                    placeholder="Ej: Los Tigres"
                    required
                    value={formData.team1Name}
                    onChange={(e) =>
                      setFormData({ ...formData, team1Name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="team2"
                    className="block text-sm font-medium mb-2"
                  >
                    Nombre del Equipo 2
                  </label>
                  <Input
                    id="team2"
                    type="text"
                    placeholder="Ej: Las Águilas"
                    required
                    value={formData.team2Name}
                    onChange={(e) =>
                      setFormData({ ...formData, team2Name: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Modo de Juego</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, gameMode: "single" })
                  }
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.gameMode === "single"
                      ? "border-primary bg-primary/10"
                      : "border-gray-300"
                  }`}
                >
                  <div className="font-semibold">Individual</div>
                  <div className="text-sm text-gray-600">1 vs 1</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, gameMode: "doubles" })
                  }
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.gameMode === "doubles"
                      ? "border-primary bg-primary/10"
                      : "border-gray-300"
                  }`}
                >
                  <div className="font-semibold">Dobles</div>
                  <div className="text-sm text-gray-600">2 vs 2</div>
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">
                Configuración del Partido
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="sets"
                    className="block text-sm font-medium mb-2"
                  >
                    Cantidad de Sets (mejor de)
                  </label>
                  <select
                    id="sets"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.sets}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sets: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value={1}>1 Set</option>
                    <option value={3}>Mejor de 3</option>
                    <option value={5}>Mejor de 5</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="points"
                    className="block text-sm font-medium mb-2"
                  >
                    Puntos para ganar set
                  </label>
                  <select
                    id="points"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.pointsToWin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pointsToWin: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value={11}>11 puntos</option>
                    <option value={15}>15 puntos</option>
                    <option value={21}>21 puntos</option>
                    <option value={25}>25 puntos</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg"
            disabled={loading}
          >
            {loading ? "Creando partido..." : "Comenzar Partido"}
          </Button>
        </form>
      </div>
    </div>
  );
}
