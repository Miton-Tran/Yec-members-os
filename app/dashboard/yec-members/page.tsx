import { DashboardProvider } from "@/components/DashboardContext";
import DashboardViews from "@/components/DashboardViews";
import KhoaSidebar from "@/components/KhoaSidebar";
import MemberDetailModal from "@/components/MemberDetailModal";
import ViewToggle from "@/components/ViewToggle";
import { getProfile, getSupabase } from "@/utils/supabase/queries";

import { ViewMode } from "@/components/ViewToggle";

interface PageProps {
  searchParams: Promise<{ view?: string; rootId?: string; avatar?: string; khoaId?: string }>;
}
export default async function FamilyTreePage({ searchParams }: PageProps) {
  const { view, rootId, avatar, khoaId } = await searchParams;
  const initialView = view as ViewMode | undefined;
  const initialShowAvatar = avatar !== "hide";

  const profile = await getProfile();
  const canEdit = profile?.role === "admin" || profile?.role === "editor";

  const supabase = await getSupabase();

  const [personsRes, relsRes, khoasRes] = await Promise.all([
    supabase
      .from("persons")
      .select("*")
      .order("birth_year", { ascending: true, nullsFirst: false }),
    supabase.from("relationships").select("*"),
    supabase.from("khoas").select("*").order("year_start", { ascending: false }),
  ]);

  const persons = personsRes.data || [];
  const relationships = relsRes.data || [];
  const khoas = khoasRes.data || [];

  return (
    <DashboardProvider
      initialView={initialView || "list"}
      initialShowAvatar={initialShowAvatar}
      initialKhoaId={khoaId}
      pageMode="members"
    >
      <div className="flex h-[calc(100vh-64px)] overflow-hidden w-full relative">
        <KhoaSidebar khoas={khoas} persons={persons} />
        
        <div className="flex-1 flex flex-col overflow-auto bg-stone-50/50 relative">
          <ViewToggle />
          <DashboardViews
            persons={persons}
            relationships={relationships}
            khoas={khoas}
            canEdit={canEdit}
          />
        </div>
      </div>
      <MemberDetailModal khoas={khoas} />
    </DashboardProvider>
  );
}
