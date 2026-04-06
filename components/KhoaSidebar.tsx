"use client";

import { Khoa, Person } from "@/types";
import { Calendar, ChevronLeft, ChevronRight, GraduationCap, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useDashboard } from "./DashboardContext";

interface KhoaSidebarProps {
  khoas: Khoa[];
  persons?: Person[];
}

export default function KhoaSidebar({ khoas, persons = [] }: KhoaSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { currentTerm, currentKhoaId, setCurrentTerm, setCurrentKhoaId, setView, pageMode } = useDashboard();

  // Extract unique terms from all persons' club_roles_history, sorted descending
  const terms = useMemo(() => {
    const termSet = new Set<string>();
    persons.forEach((p) => {
      const history = (p.club_roles_history || []) as any[];
      history.forEach((entry: any) => {
        if (entry.term) termSet.add(entry.term);
      });
    });
    return Array.from(termSet).sort((a, b) => {
      // Parse first year from term string for sorting (e.g., "2023-2024" -> 2023)
      const yearA = parseInt(a.replace(/\D/g, "").slice(0, 4), 10) || 0;
      const yearB = parseInt(b.replace(/\D/g, "").slice(0, 4), 10) || 0;
      return yearB - yearA; // descending
    });
  }, [persons]);

  return (
    <div
      className={`bg-white border-r border-stone-200 transition-all duration-300 flex flex-col items-center shrink-0 ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="h-16 w-full flex items-center justify-between px-4 border-b border-stone-100 shrink-0">
        {isExpanded && (
          <h2 className="font-serif font-bold text-stone-800 text-[16px] whitespace-nowrap overflow-hidden text-ellipsis">
            {pageMode === "tree" ? "Nhiệm kỳ" : "Lịch sử CLB"}
          </h2>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors mx-auto"
          title={isExpanded ? "Thu gọn" : "Mở rộng"}
        >
          {isExpanded ? (
            <ChevronLeft className="size-5" />
          ) : (
            <ChevronRight className="size-5" />
          )}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 w-full overflow-y-auto p-2 space-y-1">
        {/* 'Tất cả' option */}
         <button
          onClick={() => {
            setCurrentTerm(null);
            setCurrentKhoaId(null);
            setView("list");
          }}
          className={`w-full flex items-center ${isExpanded ? "justify-start gap-3 p-3" : "justify-center h-14"} rounded-xl transition-all duration-300 group relative ${
            currentTerm === null
              ? isExpanded 
                ? "bg-stone-800 text-white shadow-md shadow-stone-200 font-semibold"
                : "bg-gradient-to-br from-stone-800 to-stone-700 text-white shadow-lg shadow-stone-900/30 border border-stone-600/50"
              : isExpanded
                ? "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900 border border-transparent"
                : "bg-white border-stone-200/80 shadow-sm hover:border-stone-300 hover:bg-stone-50 border text-stone-600"
          }`}
          title={"Tất cả thành viên"}
        >
          {isExpanded ? (
            <>
              <div className="flex items-center justify-center shrink-0 size-6">
                <GraduationCap
                  className={`size-5 ${
                    currentTerm === null ? "text-white" : "text-stone-400 group-hover:text-stone-600"
                  }`}
                />
              </div>
              <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
                Tất cả thành viên
              </span>
            </>
          ) : (
             <GraduationCap className={`size-6 ${currentTerm === null ? "text-white" : "text-stone-600"}`} />
          )}
        </button>

        {/* Menu items */}
        {pageMode === "tree" ? (
          terms.map((term) => {
            const isActive = currentTerm === term;
            return (
              <button
                key={term}
                onClick={() => {
                  setCurrentTerm(term);
                  setCurrentKhoaId(null); // clear khoa filter
                  setView("tree");
                }}
                className={`w-full flex items-center ${isExpanded ? "justify-start gap-3 p-3" : "justify-center h-14"} rounded-xl transition-all duration-300 group relative ${
                  isActive
                    ? "bg-gradient-to-br from-amber-500/90 to-orange-400/90 backdrop-blur-md border border-white/30 text-white shadow-[0_8px_30px_rgb(245,158,11,0.3)] font-semibold"
                    : isExpanded 
                      ? "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900 border border-transparent"
                      : "bg-white border-stone-200/80 shadow-sm hover:border-stone-300 hover:bg-stone-50 border text-stone-600"
                }`}
                title={`Nhiệm kỳ ${term}`}
              >
                 {isExpanded ? (
                   <>
                     <div className="flex items-center justify-center shrink-0 size-6">
                        <Calendar className={`size-4 ${isActive ? "text-amber-100" : "text-stone-400 group-hover:text-stone-600"}`} />
                     </div>
                     <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
                       {term}
                     </span>
                   </>
                 ) : (
                   <span className={`font-black text-[12px] tracking-wide ${isActive ? "text-white" : "text-stone-700"}`}>
                     {term}
                   </span>
                 )}
              </button>
            );
          })
        ) : (
          khoas.map((khoa) => {
            const isActive = currentKhoaId === khoa.id;
            return (
              <button
                key={khoa.id}
                onClick={() => {
                  setCurrentKhoaId(khoa.id);
                  setCurrentTerm(null);
                  setView("overview");
                }}
                className={`w-full flex items-center ${isExpanded ? "justify-start gap-3 p-3" : "justify-center h-14"} rounded-xl transition-all duration-300 group relative ${
                  isActive
                    ? "bg-gradient-to-br from-amber-500/90 to-orange-400/90 backdrop-blur-md border border-white/30 text-white shadow-[0_8px_30px_rgb(245,158,11,0.3)] font-semibold"
                    : isExpanded 
                      ? "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900 border border-transparent"
                      : "bg-white border-stone-200/80 shadow-sm hover:border-stone-300 hover:bg-stone-50 border text-stone-600"
                }`}
                title={khoa.name}
              >
                 {isExpanded ? (
                   <>
                     <div className="flex items-center justify-center shrink-0 size-6">
                        <Users className={`size-4 ${isActive ? "text-amber-100" : "text-stone-400 group-hover:text-stone-600"}`} />
                     </div>
                     <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
                       {khoa.name} {khoa.yec_generation ? `- Thế hệ ${khoa.yec_generation}` : ""}
                     </span>
                   </>
                 ) : (
                   <span className={`font-black text-[14px] tracking-wide ${isActive ? "text-white" : "text-stone-700"}`}>
                     {khoa.name}
                   </span>
                 )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
