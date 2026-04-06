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

  // Prepare map and roots for tree views
  const personsMap = new Map();
  persons.forEach((p) => personsMap.set(p.id, p));

  const childIds = new Set(
    relationships
      .filter(
        (r) => r.type === "biological_child" || r.type === "adopted_child",
      )
      .map((r) => r.person_b),
  );

  let finalRootId = rootId;

  // If no rootId is provided, fallback to the earliest created person
  if (!finalRootId || !personsMap.has(finalRootId)) {
    const rootsFallback = persons.filter((p) => !childIds.has(p.id));
    if (rootsFallback.length > 0) {
      finalRootId = rootsFallback[0].id;
    } else if (persons.length > 0) {
      finalRootId = persons[0].id; // ultimate fallback
    }
  }

  return (
    <DashboardProvider
      initialView={initialView}
      initialRootId={finalRootId}
      initialShowAvatar={initialShowAvatar}
      initialKhoaId={khoaId}
      pageMode="tree"
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
