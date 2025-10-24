import LoginForm from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Check if user has a club
    const { data: club } = await supabase
      .from("clubs")
      .select("id, name")
      .eq("auth_user_id", user.id)
      .single();

    if (!club) {
      redirect("/club/onboarding");
    } else {
      redirect(`/club/${club.name}/${club.id}/admin`);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#121A3F] flex-col items-center justify-center py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <LoginForm />
      </div>
    </div>
  );
}
