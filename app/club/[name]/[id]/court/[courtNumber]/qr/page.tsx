import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

import { QRCodeSVG } from "qrcode.react";
import { requireClub } from "@/lib/auth";

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
    .match({ name: courtNumber, club_id: id });

  const { club } = await requireClub();

  console.log(courtData);

  /*  if (!courtData?.length) {
    notFound();
  } */
  return (
    <section className="flex flex-row items-center justify-center bg-background h-screen">
      <div className="w-1/2">
        <h3 className="text-7xl w-full font-bold text-text-primary line-h z-10 leading-20">
          Escaneá, configurá tu partido y arrancá a{" "}
          <span className="bg-accent-primary p-2 m-0 h-fit rounded-lg inline-flex">
            jugar
          </span>
          .
        </h3>
        <p className="text-text-primary text-5xl font-bold z-10 my-4 relative ">
          Número de cancha: {courtData?.length && courtData[0].name}
        </p>
      </div>
      <QRCodeSVG
        size={500}
        bgColor="#f4f6f8"
        title="court-qr"
        fgColor="#2e2e2e"
        style={{ borderRadius: "7rem", margin: "5rem" }}
        value={`/${club.name}/${club.id}/court/${
          courtData?.length && courtData[0].name
        }/match_configuration`}
      />
    </section>
  );
};

export default CourtQrPage;
