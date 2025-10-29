"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { QRCode } from "react-qrcode-logo";
import { createClient } from "@/lib/supabase/client";

interface QRCodeDisplayProps {
  value: string;
  courtName: string;
  courtId: string;
  clubName: string;
  clubId: string;
}

export const QRCodeDisplay = ({
  value,
  courtName,
  courtId,
  clubName,
  clubId,
}: QRCodeDisplayProps) => {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`court-${courtId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "court_configurations",
          filter: `court_id=eq.${courtId}`,
        },
        (payload) => {
          console.log("New match created!", payload);
          // Redirigir a la página del partido
          router.push(`/club/${clubName}/${clubId}/court/${courtName}/match`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courtId, router, clubName, clubId, courtName]);

  return (
    <section className="flex flex-row items-center justify-center bg-background h-screen">
      <div className="w-1/2">
        <h3 className="text-7xl w-full font-bold text-text-primary line-h z-10 leading-20">
          Escaneá, configurá tu partido y arrancá a{" "}
          <span className="bg-accent-primary p-2 m-0 h-fit rounded-xl inline-flex">
            jugar
          </span>
          .
        </h3>
        <p className="text-text-primary text-5xl font-bold z-10 my-4 relative ">
          Número de cancha: {courtName}
        </p>
      </div>
      <QRCode
        size={500}
        bgColor="#f4f6f8"
        fgColor="#2e2e2e"
        qrStyle="fluid"
        eyeRadius={30}
        style={{ margin: "5rem" }}
        value={value}
      />
    </section>
  );
};
