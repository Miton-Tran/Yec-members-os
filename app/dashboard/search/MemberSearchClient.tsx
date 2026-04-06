"use client";

import { useMemo, useState } from "react";
import { Search, MapPin, Briefcase, ChevronRight } from "lucide-react";
import Link from "next/link";
import DefaultAvatar from "@/components/DefaultAvatar";

interface Khoa {
  id: string;
  name: string;
}

interface Person {
  id: string;
  full_name: string;
  company?: string;
  industry?: string;
  skills?: string[] | null;
  occupation?: string;
  current_residence?: string;
  avatar_url?: string;
  khoa_id?: string;
  achievements?: string[] | null;
  status?: string | null;
  name_tag?: string | null;
}

interface MemberSearchClientProps {
  persons: Person[];
  khoas: Khoa[];
}

export default function MemberSearchClient({ persons, khoas }: MemberSearchClientProps) {
  const [query, setQuery] = useState("");
  const [selectedKhoa, setSelectedKhoa] = useState<string>("all");

  const filteredPersons = useMemo(() => {
    return persons.filter((p) => {
      // Khoa filter
      if (selectedKhoa !== "all" && p.khoa_id !== selectedKhoa) {
        return false;
      }
      
      // Text filter
      if (!query.trim()) return true;
      const lowerQuery = query.toLowerCase();
      
      // Check fields for match
      const inName = p.full_name?.toLowerCase().includes(lowerQuery);
      const inCompany = p.company?.toLowerCase().includes(lowerQuery);
      const inIndustry = p.industry?.toLowerCase().includes(lowerQuery);
      const inOcc = p.occupation?.toLowerCase().includes(lowerQuery);
      const inRes = p.current_residence?.toLowerCase().includes(lowerQuery);
      const inSkills = Array.isArray(p.skills) && p.skills.some(s => s.toLowerCase().includes(lowerQuery));
      const inStatus = p.status?.toLowerCase().includes(lowerQuery);
      const inNameTag = p.name_tag?.toLowerCase().includes(lowerQuery);

      return inName || inCompany || inIndustry || inOcc || inRes || inSkills || inStatus || inNameTag;
    });
  }, [persons, query, selectedKhoa]);

  const getKhoaName = (id?: string) => khoas.find(k => k.id === id)?.name;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Filters ── */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, kỹ năng, chuyên môn, công ty..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-amber-400 focus:ring-amber-400 transition-all outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="md:w-64">
          <select
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-amber-400 focus:ring-amber-400 transition-all outline-none appearance-none"
            value={selectedKhoa}
            onChange={(e) => setSelectedKhoa(e.target.value)}
          >
            <option value="all">Tất cả thế hệ (Khóa)</option>
            {khoas.map(k => (
              <option key={k.id} value={k.id}>{k.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Results Summary ── */}
      <p className="text-sm font-medium text-stone-500">
        Tìm thấy {filteredPersons.length} hồ sơ thành viên.
      </p>

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPersons.map((p) => (
          <Link
            key={p.id}
            href={`/dashboard?personId=${p.id}&view=member`} // Or wherever the profile modal gets triggered
            className="group flex flex-col bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300 p-5 relative overflow-hidden"
          >
            <div className="flex items-start gap-4 mb-4">
              {p.avatar_url ? (
                <div className="size-16 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="size-16 rounded-2xl bg-amber-50 shrink-0 border border-amber-100 flex items-center justify-center text-amber-600">
                  <DefaultAvatar gender="male" size={40} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-stone-900 text-lg truncate group-hover:text-amber-700 transition-colors">
                    {p.full_name}
                    {p.name_tag && <span className="text-stone-400 font-semibold text-sm ml-1.5">- {p.name_tag}</span>}
                  </h3>
                  {p.khoa_id && (
                    <span className="shrink-0 ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                      {getKhoaName(p.khoa_id)}
                    </span>
                  )}
                </div>
                
                {p.occupation ? (
                  <p className="text-sm text-stone-600 mt-1 flex items-center gap-1.5 truncate">
                    <Briefcase className="size-3.5 opacity-60 shrink-0" />
                    <span className="truncate">{p.occupation} {p.company ? `tại ${p.company}` : ''}</span>
                  </p>
                ) : p.industry ? (
                  <p className="text-sm text-stone-600 mt-1 flex items-center gap-1.5 truncate">
                    <Briefcase className="size-3.5 opacity-60 shrink-0" />
                    <span className="truncate">{p.industry}</span>
                  </p>
                ) : null}

                {p.current_residence && (
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5 truncate">
                    <MapPin className="size-3.5 opacity-60 shrink-0" />
                    <span className="truncate">{p.current_residence}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Skills / Tags */}
            <div className="mt-auto">
              <div className="flex flex-wrap gap-1.5">
                {p.status && (
                  <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200 whitespace-nowrap">
                    #{p.status}
                  </span>
                )}
                {Array.isArray(p.skills) && p.skills.length > 0 ? (
                  <>
                    {p.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-lg bg-stone-100 text-stone-600 text-[11px] font-medium border border-stone-200 whitespace-nowrap">
                        {skill}
                      </span>
                    ))}
                    {p.skills.length > 3 && (
                      <span className="px-2 py-1 rounded-lg bg-stone-50 text-stone-500 text-[11px] font-medium border border-stone-200 border-dashed">
                        +{p.skills.length - 3}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[12px] text-stone-400 italic">Chưa cập nhật kỹ năng</span>
                )}
              </div>
            </div>

            <div className="absolute right-4 bottom-4 opactiy-0 rotate-12 scale-50 group-hover:rotate-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
               <div className="size-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                 <ChevronRight className="size-5" />
               </div>
            </div>
          </Link>
        ))}

        {filteredPersons.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-stone-50 rounded-2xl border border-stone-200 border-dashed">
            <div className="size-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
              <Search className="size-6" />
            </div>
            <p className="text-stone-500 font-medium">Không tìm thấy thành viên nào phù hợp.</p>
            <button 
              onClick={() => { setQuery(""); setSelectedKhoa("all"); }}
              className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-semibold"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
