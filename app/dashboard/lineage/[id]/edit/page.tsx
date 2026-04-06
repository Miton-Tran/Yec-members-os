import KhoaTimelineEditor from "@/components/KhoaTimelineEditor";
import { getProfile, getSupabase } from "@/utils/supabase/queries";
import { notFound, redirect } from "next/navigation";

export default async function EditKhoaTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile();

  if (profile?.role !== "admin" && profile?.role !== "editor") {
    redirect("/dashboard");
  }

  const supabase = await getSupabase();
  const { data: khoa, error } = await supabase
    .from("khoas")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !khoa) {
    notFound();
  }

  return (
    <main className="flex-1 bg-stone-50/50 p-6 md:p-10 w-full overflow-y-auto relative">
       {/* Decorative bg */}
       <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-200/20 blur-[120px] rounded-full pointer-events-none" />
       
       <div className="relative z-10 w-full">
           <KhoaTimelineEditor 
              khoaId={khoa.id}
              initialSummary={khoa.summary || ""}
              initialHighlights={khoa.highlights || []}
           />
       </div>
    </main>
  );
}
