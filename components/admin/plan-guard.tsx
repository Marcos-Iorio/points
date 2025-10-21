import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PlanGuardProps {
  clubId: string;
  children: React.ReactNode;
}

export async function PlanGuard({ clubId, children }: PlanGuardProps) {
  const supabase = await createClient();

  // Obtener el support plan del club
  const { data: supportPlan } = await supabase
    .from("support_plans")
    .select("plan_type, status")
    .eq("club_id", clubId)
    .maybeSingle();

  console.log(supportPlan);

  // Verificar si el plan está activo
  const hasActivePlan =
    supportPlan &&
    supportPlan.status === "active" &&
    supportPlan.plan_type !== "pending";

  if (hasActivePlan) {
    return <>{children}</>;
  }

  // Si no tiene plan activo, mostrar overlay con blur
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Contenido con blur */}
      <div className="filter blur-sm pointer-events-none select-none h-full">
        {children}
      </div>

      {/* Overlay bloqueador */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="max-w-lg w-full mx-4 space-y-6 text-center">
          {/* Icono */}
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <svg
                className="w-16 h-16 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">
              Plan de Soporte Requerido
            </h2>
            <p className="text-lg text-muted-foreground">
              {!supportPlan
                ? "No tienes un plan de soporte activo"
                : supportPlan.plan_type === "pending"
                ? "Tu plan está pendiente de activación"
                : "Tu plan está inactivo"}
            </p>
          </div>

          {/* Descripción */}
          <p className="text-muted-foreground">
            Para acceder al panel de administración y todas las funcionalidades,
            necesitas activar un plan de soporte. Elige el plan que mejor se
            adapte a las necesidades de tu club.
          </p>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/shop">Ver Planes Disponibles</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contactar Soporte</Link>
            </Button>
          </div>

          {/* Info adicional */}
          <p className="text-sm text-muted-foreground mt-4">
            ¿Necesitas ayuda? Nuestro equipo está disponible para asistirte
          </p>
        </div>
      </div>
    </div>
  );
}
