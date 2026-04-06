import { getProfile, getSupabase } from "@/utils/supabase/queries";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, Settings } from "lucide-react";
import { Milestone } from "@/components/KhoaTimelineEditor";

export default async function KhoaBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile();

  const supabase = await getSupabase();
  const { data: khoa, error } = await supabase
    .from("khoas")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !khoa) {
    notFound();
  }

  const milestones: Milestone[] = Array.isArray(khoa.highlights) ? khoa.highlights : [];
  const canEdit = profile?.role === "admin" || profile?.role === "editor";

  return (
    <div className="flex-1 w-full bg-stone-50/50 min-h-full">
      {/* Cover Header */}
      <div className="w-full bg-stone-900 pt-12 pb-28 px-6 sm:px-10 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent opacity-80" />
         <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-sky-500/10 blur-[100px] transform translate-x-1/2 translate-y-1/2" />
         
         <div className="max-w-4xl mx-auto relative z-10 flex items-start justify-between">
            <div>
               <Link href={`/dashboard/yec-members?khoaId=${khoa.id}&view=overview`} className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition-colors mb-6 text-sm font-semibold border border-transparent hover:border-stone-700 px-3 py-1.5 -ml-3 rounded-lg">
                  <ArrowLeft className="size-4" /> Quay lại không gian Khóa
               </Link>
               
               <div className="flex items-center gap-4 mb-4">
                  <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                     Nhiệm kỳ {khoa.year_start || "—"} - {khoa.year_end || "—"}
                  </div>
               </div>
               
               <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                  {khoa.name} {khoa.yec_generation ? `- Thế hệ YEC ${khoa.yec_generation}` : ""}
               </h1>
            </div>
            
            {canEdit && (
               <Link href={`/dashboard/lineage/${khoa.id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-all shadow-sm font-semibold backdrop-blur-md">
                 <Settings className="size-4" /> <span className="hidden sm:inline">Quản lý nội dung</span>
               </Link>
            )}
         </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-30 -mt-24">
         {/* Introduction Paper */}
         <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-stone-200/80 shadow-xl shadow-stone-200/50 p-8 sm:p-12 mb-12 transform transition-all duration-300 hover:shadow-2xl">
            <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2 border-b border-stone-100 pb-4">
               <FileText className="size-5 text-amber-500" /> Thông tin tổng quan
            </h2>
            {khoa.summary ? (
               <div className="prose prose-stone prose-p:leading-relaxed prose-p:text-stone-600 max-w-none whitespace-pre-wrap">
                  {khoa.summary}
               </div>
            ) : (
               <div className="text-stone-400 italic">Chưa có lời giới thiệu nào. Cập nhật trong trình soạn thảo để thấy ngay kết quả!</div>
            )}
         </div>

         {/* Timeline */}
         <div className="px-4">
            <h3 className="text-2xl font-black text-stone-800 mb-10 flex items-center gap-3">
               Dòng thời gian sự kiện
            </h3>
            
            {milestones.length === 0 ? (
               <div className="text-stone-500 font-medium italic bg-white/50 p-8 rounded-3xl border border-stone-200 border-dashed text-center shadow-sm">
                  Dòng thời gian chưa được thiết lập. Hãy thêm các cột mốc nổi bật vào Khóa này.
               </div>
            ) : (
               <div className="relative border-l-[3px] border-stone-200 ml-4 lg:ml-6 space-y-12 pb-8">
                  {milestones.map((m, i) => (
                     <div key={m.id} className="relative pl-8 sm:pl-12 group">
                        {/* Timeline Node */}
                        <div className="absolute left-[-11px] top-1.5 w-5 h-5 bg-white border-4 border-amber-400 rounded-full group-hover:scale-125 group-hover:border-amber-500 transition-all duration-300 shadow-md" />
                        
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-3 border-b border-stone-100 pb-3">
                           <span className="text-sm font-bold text-amber-700 uppercase tracking-widest whitespace-nowrap bg-amber-100 px-3 py-1 rounded-lg border border-amber-200 w-fit drop-shadow-sm">
                              {m.period}
                           </span>
                           <h4 className="text-xl font-black text-stone-900 group-hover:text-amber-600 transition-colors">
                              {m.title}
                           </h4>
                        </div>
                        
                        <p className="text-stone-600 leading-relaxed mt-2 whitespace-pre-wrap bg-white/40 p-4 rounded-xl border border-transparent group-hover:border-stone-100 group-hover:bg-white transition-all shadow-sm group-hover:shadow-md">
                           {m.description}
                        </p>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </main>
    </div>
  );
}
