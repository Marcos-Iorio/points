import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { requireClub } from "@/lib/auth";
import { QRCodeDisplay } from "@/components/court/qr-code-display";

const CourtQrPage = async ({
  params,
}: {
  params: Promise<{ id: string; courtNumber: string }>;
}) => {
  const { id, courtNumber } = await params;
  const supabase = await createClient();

  const { data: courtData, error } = await supabase
    .from("courts")
    .select("id, name")
    .eq("name", courtNumber)
    .eq("club_id", id)
    .single();

  const { club } = await requireClub();

  if (!courtData) {
    notFound();
  }

  // Verificar si hay un partido activo
  const { data: activeMatch } = await supabase
    .from("court_configurations")
    .select("id, match_status")
    .eq("court_id", courtData.id)
    .is("match_end", null)
    .in("match_status", ["playing", "paused"])
    .order("match_start", { ascending: false })
    .limit(1)
    .single();

  // Si hay un partido activo, redirigir a la página de match
  if (activeMatch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center">
          <div className="bg-card p-8 rounded-lg shadow-lg border-2 border-accent-primary">
            <div className="text-6xl mb-6">🎾</div>
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              Partido en Curso
            </h1>
            <p className="text-xl text-text-secondary mb-6">
              No se puede generar QR mientras hay un partido activo en la cancha {courtNumber}
            </p>
            <p className="text-sm text-text-secondary mb-6">
              El QR estará disponible cuando el partido finalice.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const qrValue = `/${club.name}/${club.id}/court/${courtData.name}/match_configuration`;

  return (
    <QRCodeDisplay
      value={qrValue}
      courtName={courtData.name.toString()}
      courtId={courtData.id}
      clubName={club.name}
      clubId={club.id}
    />
  );
};

export default CourtQrPage;
