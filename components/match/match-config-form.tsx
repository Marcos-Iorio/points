"use client";
import { gsap } from "gsap/gsap-core";
import { useGSAP } from "@gsap/react";
import { stepsAnimation } from "@/utils/animations/wizard-steps";
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

  useGSAP(() => {
    const timer = setTimeout(() => {
      stepsAnimation();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Configuración del Partido
          </h1>
          <p className="text-text-secondary text-lg">
            Cancha {courtNumber} - Configurá los detalles de tu partido
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Wizard>
            <p id="step">Cancha</p>
            <p id="step">Partido</p>
          </Wizard>
        </form>
      </div>
    </div>
  );
}
