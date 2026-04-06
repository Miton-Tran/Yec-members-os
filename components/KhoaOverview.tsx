"use client";

import { Khoa } from "@/types";
import { Calendar, GraduationCap, Star } from "lucide-react";
import Link from "next/link";

interface KhoaOverviewProps {
  khoa: Khoa;
}

export default function KhoaOverview({ khoa }: KhoaOverviewProps) {
  const highlights = Array.isArray(khoa.highlights) ? khoa.highlights : [];

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 space-y-6">
      
      {/* Hero Banner — full-width card with gradient background */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-900 p-8 sm:p-10 shadow-xl">
        {/* Decorative glows */}
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-amber-500/25 rounded-full blur-[100px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-sky-500/15 rounded-full blur-[80px] translate-x-1/4 translate-y-1/4 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-white/5 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-6">
          {/* Left: Name & Badge */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full mb-4">
              <GraduationCap className="size-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest">Thế hệ CLB</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none mb-3">
              {khoa.name} {khoa.yec_generation ? `- Thế hệ YEC ${khoa.yec_generation}` : ""}
            </h2>
            
            {/* Summary right under the name */}
            {khoa.summary && (
              <p className="text-stone-300 text-[15px] leading-relaxed max-w-xl mt-4 whitespace-pre-wrap">
                {khoa.summary}
              </p>
            )}
            {!khoa.summary && (
              <p className="text-stone-500 italic text-sm mt-3">Chưa có lời giới thiệu cho khóa này.</p>
            )}
          </div>

          {/* Right: Term Badge */}
          <div className="flex flex-col items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-5 shrink-0 min-w-[140px]">
            <Calendar className="size-6 text-amber-400 mb-1" />
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Nhiệm kỳ</span>
            <span className="text-2xl font-black text-white tracking-tight">
              {khoa.year_start || "?"} – {khoa.year_end || "?"}
            </span>
          </div>
        </div>

        {/* View full blog link */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
          <Link 
            href={`/dashboard/lineage/${khoa.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors group"
          >
            Xem trang tổng kết đầy đủ 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>

      {/* Timeline Highlights */}
      {highlights.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 opacity-50 pointer-events-none" />
          <h3 className="text-xl font-black text-stone-800 tracking-tight mb-8 flex items-center gap-2 relative z-10">
            <Star className="size-6 text-amber-500 fill-amber-500" />
            Điểm nhấn nổi bật
          </h3>
          
          <div className="relative border-l-[3px] border-amber-200 ml-3 sm:ml-4 z-10">
            <div className="max-h-[220px] overflow-y-auto pr-4 space-y-5 custom-scrollbar">
              {highlights.map((h: any, i: number) => (
                <div key={h.id || i} className="relative pl-6 sm:pl-8 group py-1">
                   {/* Timeline dot */}
                   <div className="absolute -left-[20px] top-3 size-3 rounded-full bg-white border-[3px] border-amber-400 group-hover:border-amber-500 group-hover:scale-150 transition-all duration-300 shadow-md shadow-amber-100" />
                   
                   <div className="bg-gradient-to-br from-stone-50 to-white border border-stone-100 rounded-xl p-4 shadow-sm group-hover:shadow-md transition-all duration-300">
                     <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                       {h.period && (
                         <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded border border-amber-100 w-fit">
                           {h.period}
                         </span>
                       )}
                       {h.title && (
                         <h4 className="text-sm font-bold text-stone-800 group-hover:text-amber-700 transition-colors leading-snug">{h.title}</h4>
                       )}
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
