"use client"

import { Person, Khoa } from "@/types";
import { useMemo, useState } from "react";
import { Users, BookOpen, Briefcase, Plane, Heart, Filter, UserX } from "lucide-react";
import { motion } from "framer-motion";

interface ClubStatsProps {
  persons: Person[];
  khoas: Khoa[];
}

export default function ClubStats({ persons, khoas }: ClubStatsProps) {
  const [selectedKhoaId, setSelectedKhoaId] = useState<string>("all");

  const filteredPersons = useMemo(() => {
    if (selectedKhoaId === "all") return persons;
    return persons.filter(p => p.khoa_id === selectedKhoaId);
  }, [persons, selectedKhoaId]);

  const stats = useMemo(() => {
     let hocDH = 0;
     let hoatDong = 0;
     let duHoc = 0;
     let diLam = 0;
     let thatNghiep = 0;
     let daKetHon = 0;
     let khac = 0;
     let chuaCapNhat = 0;
     
     let male = 0;
     let female = 0;

     filteredPersons.forEach(p => {
        if (p.gender === 'male') male++;
        else if (p.gender === 'female') female++;

        if (p.marital_status === 'Đã kết hôn') daKetHon++;

        const st = p.status;
        if (!st) { chuaCapNhat++; return; }
        
        if (st === 'Học ĐH') hocDH++;
        else if (st === 'Hoạt động CLB') hoatDong++;
        else if (st === 'Du học') duHoc++;
        else if (st === 'Đi làm') diLam++;
        else if (st === 'Thất nghiệp') thatNghiep++;
        else khac++;
     });

     return {
        total: filteredPersons.length,
        hocDH,
        hoatDong,
        duHoc,
        diLam,
        thatNghiep,
        daKetHon,
        khac,
        chuaCapNhat,
        male,
        female
     };
  }, [filteredPersons]);

  const renderStatCard = (icon: any, title: string, count: number, colorClass: string, bgColorClass: string) => (
    <div className={`p-5 rounded-2xl border ${colorClass} bg-white shadow-sm flex items-center gap-4`}>
       <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${bgColorClass} ${colorClass.replace('border-', 'text-')}`}>
          {icon}
       </div>
       <div className="flex-1">
          <p className="text-sm font-medium text-stone-500">{title}</p>
          <p className="text-2xl font-bold text-stone-900">{count}</p>
       </div>
    </div>
  );

  return (
    <div className="space-y-6">
       {/* Filters */}
       <div className="bg-white p-4 rounded-full border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="flex items-center gap-2 pl-2 text-stone-500 font-medium whitespace-nowrap hidden sm:flex">
             <Filter className="size-4" /> Bộ lọc Thống kê:
          </div>
          <select 
             className="flex-1 px-4 py-2 rounded-full border border-stone-200 bg-stone-50 focus:bg-white focus:ring-amber-400 outline-none font-semibold text-stone-700"
             value={selectedKhoaId}
             onChange={e => setSelectedKhoaId(e.target.value)}
          >
             <option value="all">Tất cả thế hệ (Khóa)</option>
             {khoas.map(k => (
                <option key={k.id} value={k.id}>{k.name}</option>
             ))}
          </select>
       </div>

       {/* Primary Stats */}
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-lg relative overflow-hidden">
             <Users className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20" />
             <p className="text-amber-100 font-medium mb-1">Tổng Số Thành Viên</p>
             <h2 className="text-5xl font-black">{stats.total}</h2>
          </div>
          <div className="p-6 rounded-3xl bg-linear-to-br from-sky-400 to-blue-500 text-white shadow-lg relative overflow-hidden">
             <p className="text-sky-100 font-medium mb-1">Nam</p>
             <h2 className="text-5xl font-black">{stats.male}</h2>
          </div>
          <div className="p-6 rounded-3xl bg-linear-to-br from-rose-400 to-pink-500 text-white shadow-lg relative overflow-hidden">
             <p className="text-rose-100 font-medium mb-1">Nữ</p>
             <h2 className="text-5xl font-black">{stats.female}</h2>
          </div>
       </div>

       {/* Grid Status Stats */}
       <div className="bg-stone-50/50 rounded-3xl p-6 sm:p-8 border border-stone-200/60 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
          <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2 border-b border-stone-200 pb-4">
             <Briefcase className="size-5 text-amber-600" />
             Trạng thái Công việc & Học tập
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {renderStatCard(<BookOpen className="size-6" />, "Đang học ĐH", stats.hocDH, "border-cyan-200", "bg-cyan-50")}
             {renderStatCard(<Users className="size-6" />, "Hoạt động CLB", stats.hoatDong, "border-amber-200", "bg-amber-50")}
             {renderStatCard(<Plane className="size-6" />, "Du học sinh", stats.duHoc, "border-purple-200", "bg-purple-50")}
             {renderStatCard(<Briefcase className="size-6" />, "Đã đi làm", stats.diLam, "border-emerald-200", "bg-emerald-50")}
             {renderStatCard(<Heart className="size-6" />, "Đã kết hôn", stats.daKetHon, "border-pink-200", "bg-pink-50")}
             {renderStatCard(<UserX className="size-6" />, "Thất nghiệp", stats.thatNghiep, "border-rose-200", "bg-rose-50")}
             {renderStatCard(<Users className="size-6" />, "Trạng thái khác", stats.khac, "border-stone-200", "bg-stone-50")}
          </div>
          
          {stats.chuaCapNhat > 0 && (
             <div className="mt-8 text-center text-stone-500 text-sm">
                * Có <span className="font-bold text-stone-700">{stats.chuaCapNhat}</span> thành viên chưa cập nhật trạng thái
             </div>
          )}
       </div>

       {/* Khóa Overview Table (Only when "all" is selected) */}
       {selectedKhoaId === "all" && (
          <motion.div initial={{ opacity: 0}} animate={{ opacity: 1}} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/60 shadow-sm">
              <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                 Thống kê phân bổ theo thế hệ (Khóa)
              </h3>
              <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                     <thead>
                         <tr className="bg-stone-50 border-b border-stone-200 text-stone-600">
                             <th className="px-4 py-3 font-semibold rounded-tl-xl">Khóa</th>
                             <th className="px-4 py-3 font-semibold text-center">Nhiệm kỳ</th>
                             <th className="px-4 py-3 font-semibold text-right">Thành viên</th>
                             <th className="px-4 py-3 font-semibold text-right rounded-tr-xl">% Tỉ trọng</th>
                         </tr>
                     </thead>
                     <tbody>
                         {khoas.map(k => {
                             const cnt = persons.filter(p => p.khoa_id === k.id).length;
                             const pct = stats.total > 0 ? Math.round((cnt / stats.total) * 100) : 0;
                             return (
                                 <tr key={k.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                                     <td className="px-4 py-3 font-bold text-stone-900">{k.name}</td>
                                     <td className="px-4 py-3 text-center text-stone-500">{k.year_start} - {k.year_end}</td>
                                     <td className="px-4 py-3 text-right font-bold text-amber-600">{cnt}</td>
                                     <td className="px-4 py-3 text-right text-stone-500">
                                         <div className="flex items-center justify-end gap-2">
                                             <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                                 <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%`}} />
                                             </div>
                                             <span className="w-8">{pct}%</span>
                                         </div>
                                     </td>
                                 </tr>
                             );
                         })}
                     </tbody>
                 </table>
              </div>
          </motion.div>
       )}
    </div>
  );
}
