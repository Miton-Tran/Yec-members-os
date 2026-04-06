import { getSupabase } from "@/utils/supabase/queries";
import { redirect } from "next/navigation";
import RequestsList from "./RequestsList";

export default async function RequestsPage() {
  const supabase = await getSupabase();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "editor") {
    redirect("/dashboard");
  }

  // Load pending LINK_PROFILE requests
  // For each request, we need: request details, person name
  const { data: pendingRequests, error } = await supabase
    .from("edit_requests")
    .select(`
      id,
      requested_by,
      created_at,
      persons (
        id,
        full_name,
        khoas (name, yec_generation)
      )
    `)
    .eq("status", "pending")
    .eq("changes->>action", "LINK_PROFILE")
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 overflow-auto bg-stone-50/50 flex flex-col pt-8 relative w-full">
      <div className="max-w-4xl mx-auto px-4 pb-8 sm:px-6 w-full relative z-10">
        <div className="mb-8 flex flex-col justify-between items-start">
          <h1 className="title">Phê Duyệt Yêu Cầu</h1>
          <p className="text-stone-500 mt-2 text-sm sm:text-base max-w-2xl">
            Quản lý các yêu cầu liên kết hồ sơ do thành viên gửi lên.
          </p>
        </div>

        <RequestsList requests={pendingRequests || []} />
      </div>
    </main>
  );
}
