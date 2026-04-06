"use client";

import PersonCard from "@/components/PersonCard";
import { Khoa, Person, Relationship } from "@/types";
import { ArrowUpDown, Filter, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useDashboard } from "./DashboardContext";

interface DashboardMemberListProps {
  initialPersons: Person[];
  relationships: Relationship[];
  canEdit?: boolean;
  khoas: Khoa[];
}

export default function DashboardMemberList({
  initialPersons,
  relationships,
  canEdit = false,
  khoas,
}: DashboardMemberListProps) {
  const { setShowCreateMember } = useDashboard();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("khoa_desc");
  const [filterOption, setFilterOption] = useState("all");

  const filteredPersons = useMemo(() => {
    return initialPersons.filter((person) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        person.full_name.toLowerCase().includes(term) ||
        (person.occupation || "").toLowerCase().includes(term) ||
        (person.industry || "").toLowerCase().includes(term) ||
        (person.company || "").toLowerCase().includes(term) ||
        (person.current_residence || "").toLowerCase().includes(term) ||
        (person.club_role_title || "").toLowerCase().includes(term) ||
        (person.skills || []).some((s) => s.toLowerCase().includes(term));

      let matchesFilter = true;
      switch (filterOption) {
        case "male":
          matchesFilter = person.gender === "male";
          break;
        case "female":
          matchesFilter = person.gender === "female";
          break;
        case "has_history":
          matchesFilter = Array.isArray(person.club_roles_history) && person.club_roles_history.length > 0;
          break;
        case "no_history":
          matchesFilter = !Array.isArray(person.club_roles_history) || person.club_roles_history.length === 0;
          break;
        case "all":
        default:
          matchesFilter = true;
          break;
      }

      return matchesSearch && matchesFilter;
    });
  }, [initialPersons, searchTerm, filterOption]);

  // Map khoaId -> Khoa for quick lookup
  const khoaMap = useMemo(() => {
    const map = new Map<string, Khoa>();
    khoas.forEach(k => map.set(k.id, k));
    return map;
  }, [khoas]);

  const sortedPersons = useMemo(() => {
    let sorted = [...filteredPersons];

    // Sắp xếp phẳng trước (cho các tuỳ chọn không phải nhóm theo khoá)
    if (!sortOption.includes("khoa")) {
      return sorted.sort((a, b) => {
        switch (sortOption) {
          case "name_asc":
            return a.full_name.localeCompare(b.full_name, "vi");
          case "name_desc":
            return b.full_name.localeCompare(a.full_name, "vi");
          case "updated_desc":
            return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
          case "updated_asc":
            return new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime();
          default:
            return 0;
        }
      });
    }

    // Nếu sort theo Khoá (khoa_asc / khoa_desc)
    // Trả về danh sách được sắp xếp theo tên (A-Z) để đảm bảo danh sách phẳng cũng có thứ tự
    // Việc group sẽ được thực hiện ở render
    return sorted.sort((a, b) => a.full_name.localeCompare(b.full_name, "vi"));
  }, [filteredPersons, sortOption]);

  return (
    <>
      <div className="mb-8 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-sm border border-stone-200/60 transition-all duration-300 relative z-10 w-full">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
            <div className="relative flex-1 max-w-sm group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Tìm theo tên, chức vụ, nghề nghiệp, nơi ở..."
                className="bg-white/90 text-stone-900 w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/80 shadow-sm placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto items-center">
              <div className="relative w-full sm:w-auto">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                <select
                  className="appearance-none bg-white/90 text-stone-700 w-full sm:w-40 pl-9 pr-8 py-2.5 rounded-xl border border-stone-200/80 shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 hover:border-amber-300 font-medium text-sm transition-all focus:bg-white"
                  value={filterOption}
                  onChange={(e) => setFilterOption(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="has_history">Đã có hồ sơ HĐ</option>
                  <option value="no_history">Chưa có hồ sơ HĐ</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="size-4 text-stone-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              <div className="relative w-full sm:w-auto">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                <select
                  className="appearance-none bg-white/90 text-stone-700 w-full sm:w-52 pl-9 pr-8 py-2.5 rounded-xl border border-stone-200/80 shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 hover:border-amber-300 font-medium text-sm transition-all focus:bg-white"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="khoa_desc">Theo khóa (Mới nhất)</option>
                  <option value="khoa_asc">Theo khóa (Cũ nhất)</option>
                  <option value="name_asc">Tên (A-Z)</option>
                  <option value="name_desc">Tên (Z-A)</option>
                  <option value="updated_desc">Cập nhật (Mới nhất)</option>
                  <option value="updated_asc">Cập nhật (Cũ nhất)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="size-4 text-stone-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {canEdit && (
            <button
              onClick={() => setShowCreateMember(true)}
              className="btn-primary"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              Thêm thành viên
            </button>
          )}
        </div>
      </div>

      {sortedPersons.length > 0 ? (
        sortOption.includes("khoa") ? (
          <div className="space-y-12">
            {Object.entries(
              sortedPersons.reduce(
                (acc, person) => {
                  const kId = person.khoa_id || "unknown";
                  if (!acc[kId]) acc[kId] = [];
                  acc[kId].push(person);
                  return acc;
                },
                {} as Record<string, Person[]>,
              ),
            )
              .sort(([kIdA], [kIdB]) => {
                if (kIdA === "unknown") return 1;
                if (kIdB === "unknown") return -1;
                const khoaA = khoaMap.get(kIdA);
                const khoaB = khoaMap.get(kIdB);
                const nameA = khoaA?.name || "";
                const nameB = khoaB?.name || "";
                
                // Trích xuất số khóa (vd: "K55" -> 55) để sort lùi hoặc tiến
                const numA = parseInt(nameA.replace(/\D/g, "")) || 0;
                const numB = parseInt(nameB.replace(/\D/g, "")) || 0;

                if (sortOption === "khoa_desc") {
                  return numB - numA;
                }
                return numA - numB;
              })
              .map(([kId, persons]) => {
                const khoa = khoaMap.get(kId);
                const name = khoa ? `${khoa.name}${khoa.yec_generation ? ` - Thế hệ YEC ${khoa.yec_generation}` : ""}` : "Chưa phân loại khóa";
                return (
                  <div key={kId} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-stone-200"></div>
                      <h3 className="text-lg font-serif font-bold text-amber-800 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200/50 shadow-sm">
                        {name}
                      </h3>
                      <div className="h-px flex-1 bg-stone-200"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {persons.map((person) => (
                        <PersonCard key={person.id} person={person} khoas={khoas} />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPersons.map((person) => (
              <PersonCard key={person.id} person={person} khoas={khoas} />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12 text-stone-400 italic">
          {initialPersons.length > 0
            ? "Không tìm thấy thành viên phù hợp."
            : "Chưa có thành viên nào. Hãy thêm thành viên đầu tiên."}
        </div>
      )}
    </>
  );
}
