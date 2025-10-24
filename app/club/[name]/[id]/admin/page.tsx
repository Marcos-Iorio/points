import React from "react";
import { AdminSideMenu } from "@/components/admin/admin-side-menu";
import { CourtsStatusCard } from "@/components/admin/dashboard/courts-status-card";
import { requireClubOwner } from "@/lib/auth";

const ClubAdminPage = async ({
  params,
}: {
  params: Promise<{ name: string; id: string }>;
}) => {
  const { name, id } = await params;

  // Verificar autenticación y ownership del club en una línea
  const { user, club } = await requireClubOwner(id);

  return (
    <div className="flex h-screen bg-background">
      <AdminSideMenu
        clubData={{ name: name, id: id }}
        userEmail={user.email}
        userName={club.name}
      />
      <main className="flex-1 overflow-auto p-3">
        <section className="bg-surface border border-border  rounded-lg p-5 h-full">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-600">
            Bienvenido al panel de administración de {club.name}
          </p>
          <CourtsStatusCard clubId={club.id} />
        </section>
      </main>
    </div>
  );
};

export default ClubAdminPage;
