import { PlanGuard } from "@/components/admin/plan-guard";

export default async function ClubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PlanGuard clubId={id}>{children}</PlanGuard>;
}
