import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { requireClub } from "@/lib/auth";
import { QRCodeDisplay } from "@/components/qr-code-display";

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
    .single();

  const { club } = await requireClub();

  if (!courtData) {
    notFound();
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
