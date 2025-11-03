"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createMatchConfiguration } from "@/app/actions/match";
import Wizard from "../wizard";

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
    sets: 3,
    goldenPoint: true,
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

  if (activeMatch) {
    const teamNames =
      activeMatch.configuration?.team1Name &&
      activeMatch.configuration?.team2Name
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
                  Partido iniciado:{" "}
                  {new Date(activeMatch.match_start).toLocaleTimeString(
                    "es-AR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              )}
            </div>
            <Button
              onClick={() =>
                router.push(`/${clubName}/${clubId}/court/${courtNumber}/match`)
              }
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
        <form
          onSubmit={handleSubmit}
          className="space-y-6 h-full flex flex-col"
        >
          <Wizard>
            {/* Step 1: Bienvenida */}
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🎾</div>
                <h1 className="text-4xl font-bold text-text-primary mb-2">
                  ¡Bienvenidos!
                </h1>
                <p className="text-text-secondary text-xl mb-2">
                  Vamos a configurar tu partido
                </p>
                <p className="text-text-secondary text-lg">
                  Cancha {courtNumber}
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border-2 border-accent-primary/20">
                <p className="text-text-secondary text-center">
                  En los próximos pasos configuraremos los nombres de los
                  equipos, cantidad de sets y punto de oro.
                </p>
              </div>
            </div>

            {/* Step 2: Nombres de equipos */}
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-text-primary mb-2">
                  Nombres de los Equipos
                </h2>
                <p className="text-text-secondary">
                  ¿Quiénes van a jugar?
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="team1"
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    Equipo 1
                  </label>
                  <Input
                    id="team1"
                    type="text"
                    placeholder="Ej: Juan y Pedro"
                    value={formData.team1Name}
                    onChange={(e) =>
                      setFormData({ ...formData, team1Name: e.target.value })
                    }
                    required
                    className="h-12 text-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="team2"
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    Equipo 2
                  </label>
                  <Input
                    id="team2"
                    type="text"
                    placeholder="Ej: María y Ana"
                    value={formData.team2Name}
                    onChange={(e) =>
                      setFormData({ ...formData, team2Name: e.target.value })
                    }
                    required
                    className="h-12 text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Configuración del partido */}
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-text-primary mb-2">
                  Configuración del Partido
                </h2>
                <p className="text-text-secondary">
                  Definí las reglas del juego
                </p>
              </div>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="sets"
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    Cantidad de Sets
                  </label>
                  <select
                    id="sets"
                    value={formData.sets}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sets: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-12 text-lg rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value={1}>1 Set</option>
                    <option value={3}>3 Sets (al mejor de 3)</option>
                    <option value={5}>5 Sets (al mejor de 5)</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3 bg-card p-4 rounded-lg border-2 border-accent-primary/20">
                  <input
                    id="goldenPoint"
                    type="checkbox"
                    checked={formData.goldenPoint}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        goldenPoint: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                  <label
                    htmlFor="goldenPoint"
                    className="text-text-primary font-medium cursor-pointer"
                  >
                    Punto de Oro (en 40-40)
                  </label>
                </div>
              </div>
            </div>

            {/* Step 4: Confirmación */}
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-3xl font-bold text-text-primary mb-2">
                  ¡Todo Listo!
                </h2>
                <p className="text-text-secondary">
                  Revisá la configuración antes de empezar
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border-2 border-accent-primary space-y-4">
                <div className="border-b border-border pb-3">
                  <p className="text-sm text-text-secondary mb-1">
                    Equipos
                  </p>
                  <p className="text-lg font-semibold text-text-primary">
                    {formData.team1Name || "Equipo 1"} vs{" "}
                    {formData.team2Name || "Equipo 2"}
                  </p>
                </div>
                <div className="border-b border-border pb-3">
                  <p className="text-sm text-text-secondary mb-1">
                    Cantidad de Sets
                  </p>
                  <p className="text-lg font-semibold text-text-primary">
                    {formData.sets === 1
                      ? "1 Set"
                      : `${formData.sets} Sets (al mejor de ${formData.sets})`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">
                    Punto de Oro
                  </p>
                  <p className="text-lg font-semibold text-text-primary">
                    {formData.goldenPoint ? "Activado" : "Desactivado"}
                  </p>
                </div>
              </div>
            </div>
          </Wizard>
        </form>
      </div>
    </div>
  );
}
