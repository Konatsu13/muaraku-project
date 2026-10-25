import { redirect } from "next/navigation";
import { SupportWorkspace } from "./SupportWorkspace";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSupportPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/?auth=login&next=%2Fadmin%2Fsupport");

  const { data: staffRoles, error: rolesError } = await supabase
    .from("staff_roles")
    .select("role")
    .eq("user_id", user.id);

  const roles = rolesError ? [] : (staffRoles || []).map((row) => row.role);
  if (!roles.includes("admin") && !roles.includes("support")) {
    redirect("/app?error=unauthorized_admin");
  }

  return <SupportWorkspace />;
}
