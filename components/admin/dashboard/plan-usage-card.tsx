import { getClubPlanLimits } from "@/lib/subscription/plan-limits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PlanUsageCardProps {
  clubId: string;
}

export async function PlanUsageCard({ clubId }: PlanUsageCardProps) {
  const limits = await getClubPlanLimits(clubId);

  if (!limits) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan de Suscripción</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No tienes un plan activo</p>
          <Button asChild className="mt-4">
            <Link href="/shop">Ver Planes</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const courtsPercentage = limits.maxCourts
    ? (limits.currentCourts / limits.maxCourts) * 100
    : 0;

  const usersPercentage = limits.maxUsers
    ? (limits.currentUsers / limits.maxUsers) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso del Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Canchas */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Canchas</span>
            <span className="text-sm text-muted-foreground">
              {limits.currentCourts} / {limits.maxCourts ?? "∞"}
            </span>
          </div>
          {limits.maxCourts && (
            <Progress value={courtsPercentage} className="h-2" />
          )}
          {!limits.canAddCourt && (
            <p className="text-xs text-destructive">
              Has alcanzado el límite de canchas
            </p>
          )}
        </div>

        {/* Usuarios */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Usuarios</span>
            <span className="text-sm text-muted-foreground">
              {limits.currentUsers} / {limits.maxUsers ?? "∞"}
            </span>
          </div>
          {limits.maxUsers && (
            <Progress value={usersPercentage} className="h-2" />
          )}
          {!limits.canAddUser && (
            <p className="text-xs text-destructive">
              Has alcanzado el límite de usuarios
            </p>
          )}
        </div>

        {/* Botón para upgrade si está cerca del límite */}
        {(courtsPercentage > 80 || usersPercentage > 80) && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Estás cerca del límite de tu plan
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/shop">Actualizar Plan</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
