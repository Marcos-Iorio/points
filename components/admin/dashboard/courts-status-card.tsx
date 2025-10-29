import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

interface CourtsStatusCardProps {
  clubId: string;
}

export async function CourtsStatusCard({ clubId }: CourtsStatusCardProps) {
  const supabase = await createClient();

  // Obtener total de canchas registradas del club
  const { data: courts, error: courtsError } = await supabase
    .from("courts")
    .select("id, name")
    .eq("club_id", clubId);

  if (courtsError) {
    console.error("Error fetching courts:", courtsError);
  }

  const totalCourts = courts?.length || 0;

  // Obtener canchas con match activo
  const { data: activeMatches, error: matchesError } = await supabase
    .from("court_configurations")
    .select("court_id")
    .in("court_id", courts?.map((c) => c.id) || [])
    .is("match_end", null)
    .in("match_status", ["playing", "paused"]);

  if (matchesError) {
    console.error("Error fetching active matches:", matchesError);
  }

  const courtsInUse = activeMatches?.length || 0;
  const courtsAvailable = totalCourts - courtsInUse;

  if (totalCourts === 0) {
    return (
      <Card className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10">
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 text-6xl opacity-20">🎾</div>
            <p className="mb-2 text-lg font-medium text-foreground">
              Comienza a usar el sistema de seguimiento
            </p>
            <p className="mb-6 text-sm text-muted-foreground max-w-md">
              Adquiere kits de seguimiento para tus canchas y comienza a
              digitalizar tus partidos de pádel. Controla la ocupación en tiempo
              real.
            </p>
            <Button asChild>
              <Link href="/shop">Comprar Kits</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10">
      <CardHeader>
        <CardTitle>Estado de Canchas</CardTitle>
        <CardDescription>Vista general de la ocupación actual</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* Total de canchas */}
          <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md">
            <div className="mb-2 text-3xl font-bold text-foreground">
              {totalCourts}
            </div>
            <div className="text-xs text-muted-foreground font-medium text-center">
              Total de Canchas
            </div>
          </div>

          {/* Canchas en uso */}
          <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 transition-all hover:border-chart-1/50 hover:shadow-md">
            <div className="mb-2 text-3xl font-bold text-chart-1">
              {courtsInUse}
            </div>
            <div className="text-xs text-muted-foreground font-medium text-center">
              En Uso
            </div>
          </div>

          {/* Canchas disponibles */}
          <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 transition-all hover:border-chart-2/50 hover:shadow-md">
            <div className="mb-2 text-3xl font-bold text-chart-2">
              {courtsAvailable}
            </div>
            <div className="text-xs text-muted-foreground font-medium text-center">
              Disponibles
            </div>
          </div>
        </div>

        {/* Barra de progreso visual */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Ocupación</span>
            <span>
              {totalCourts > 0
                ? Math.round((courtsInUse / totalCourts) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-gradient-to-r from-chart-1 to-chart-1/80 transition-all duration-500"
              style={{
                width: `${
                  totalCourts > 0 ? (courtsInUse / totalCourts) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Botón de acción rápida */}
        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/shop">Comprar más kits</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
