"use client";

import DefaultAvatar from "@/components/DefaultAvatar";
import { Person } from "@/types";
import { calculateAge, getZodiacAnimal, getZodiacSign } from "@/utils/dateHelpers";
import { motion, Variants } from "framer-motion";
import { Award, Briefcase, Link as LinkIcon, MapPin, Phone, Star, Tag } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { FemaleIcon, MaleIcon } from "./GenderIcons";
import { useMemo } from "react";

import { getMemberStatusTag } from "@/utils/clubLogic";

interface MemberDetailContentProps {
  person: Person & { khoa_name?: string };
  privateData: Record<string, unknown> | null;
  isAdmin: boolean;
  canEdit?: boolean;
  khoas?: any[]; // the Khoa[] array
}

export default function MemberDetailContent({
  person,
  privateData,
  isAdmin,
  khoas = [],
}: MemberDetailContentProps) {
  const fullPerson = { ...person, ...privateData };
  const bio = (fullPerson.bio_long as string) || (fullPerson.note as string) || "";
  
  const skills: string[] = fullPerson.skills || [];
  const achievements: string[] = fullPerson.achievements || [];
  const lookingFor: string[] = fullPerson.looking_for_connections || [];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    },
  };

  const currentAge = calculateAge(
    person.birth_year,
    person.birth_month,
    person.birth_day,
    null, null, null, false
  )?.age;
  const statusTag = getMemberStatusTag(person.khoa_id, khoas);
  const myKhoa = khoas?.find((k) => k.id === person.khoa_id);
  const yecGenStr = myKhoa?.yec_generation ? ` - Thế hệ YEC ${myKhoa.yec_generation}` : "";
  const displayKhoaName = myKhoa?.name || person.khoa_name;

  const rolesHistory = (person.club_roles_history || []) as any[];

  // Lấy entry có nhiệm kỳ năm cao nhất (VD: "2023-2024" > "2020-2021")
  const latestRole = useMemo(() => {
    if (rolesHistory.length === 0) return null;
    return rolesHistory.reduce((best: any, cur: any) => {
      const bestYear = parseInt((best?.term || "0").replace(/\D/g, "").slice(0, 4), 10) || 0;
      const curYear = parseInt((cur?.term || "0").replace(/\D/g, "").slice(0, 4), 10) || 0;
      return curYear > bestYear ? cur : best;
    }, rolesHistory[0]);
  }, [rolesHistory]);

  const systemMaxK = useMemo(() => {
     let max = 0;
     khoas?.forEach(k => {
         const match = k.name.match(/K(\d+)/i);
         if (match) {
            const num = parseInt(match[1], 10);
            if (num > max) max = num;
         }
     });
     return max;
  }, [khoas]);

  let computedYecStatus = "";
  if (displayKhoaName && systemMaxK > 0) {
     const match = displayKhoaName.match(/K(\d+)/i);
     if (match) {
         const myK = parseInt(match[1], 10);
         if (myK >= systemMaxK) computedYecStatus = "Thành Viên";
         else if (myK >= systemMaxK - 2) computedYecStatus = "Ban Cố Vấn";
         else computedYecStatus = "Cựu Thành Viên";
     }
  }

  return (
    <motion.div
      layout
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="bg-stone-50/50 min-h-full pb-12"
    >
      {/* Header Cover */}
      <div className="h-32 sm:h-40 relative shrink-0">
        {/* Glow Effects Container (overflow hidden so glows don't bleed out of header) */}
        <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
          <div className={`absolute right-10 -bottom-20 w-64 h-64 rounded-full blur-[80px] opacity-60 ${person.gender === 'male' ? 'bg-sky-500' : person.gender === 'female' ? 'bg-rose-500' : 'bg-amber-500'}`} />
          <div className="absolute -left-10 top-0 w-48 h-48 rounded-full blur-[60px] opacity-30 bg-white" />
        </div>

        {/* Avatar Elements & Quick Tags (Aligned to avatar) */}
        <motion.div
          variants={itemVariants}
          className="absolute -bottom-16 sm:-bottom-20 left-6 sm:left-10 z-20 flex gap-4 sm:gap-6 items-end pb-1 sm:pb-3"
        >
          {/* Avatar Container */}
          <div className="relative shrink-0">
            <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl border-[5px] border-white flex items-center justify-center text-4xl font-bold bg-white shadow-xl rotate-3 transition-transform hover:rotate-0 duration-300">
              <div className="absolute inset-0 bg-stone-100 rounded-xl -rotate-3 transition-transform hover:rotate-0 duration-300 overflow-hidden flex items-center justify-center">
                  {person.avatar_url ? (
                    <Image
                      unoptimized
                      src={person.avatar_url}
                      alt={person.full_name}
                      width={144}
                      height={144}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <DefaultAvatar gender={person.gender} size={144} />
                  )}
              </div>
            </div>
            
            <div className={`absolute -bottom-1 -right-1 z-30 size-8 sm:size-10 rounded-xl ring-4 ring-white shadow-lg flex items-center justify-center rotate-12 ${
                person.gender === "male" ? "bg-sky-100 text-sky-600" : person.gender === "female" ? "bg-rose-100 text-rose-600" : "bg-stone-100 text-stone-600"
              }`}>
              {person.gender === "male" ? <MaleIcon className="size-5" /> : person.gender === "female" ? <FemaleIcon className="size-5" /> : null}
            </div>
          </div>

          {/* Quick Tags mapped next to Avatar */}
          <div className="flex flex-col justify-end gap-2 sm:gap-2.5 pb-2 sm:pb-4 relative z-30 drop-shadow-md">
             {computedYecStatus && (
                 <div className="w-fit bg-white/95 text-stone-900 border-2 border-amber-400 px-3 py-1 rounded-full text-xs sm:text-sm font-black shadow-sm mb-0.5">
                     ⭐ {computedYecStatus}
                 </div>
             )}
             <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                 {displayKhoaName && (
                     <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-white border border-amber-300 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-bold tracking-wide shadow-sm whitespace-nowrap">
                         {displayKhoaName}{yecGenStr}
                     </span>
                 )}
                 {latestRole?.department && latestRole.department !== "Không thuộc ban" && (
                     <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white border border-orange-300 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg shadow-sm text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap">
                         {latestRole.department}
                     </span>
                 )}
                 {latestRole?.role_title && latestRole.role_title.toLowerCase() !== "thành viên" && (
                     <span className="bg-gradient-to-r from-orange-500 to-rose-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg border border-orange-400 shadow-sm text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap">
                         {latestRole.role_title}
                     </span>
                 )}
             </div>
             {/* Location Right at the bottom chân avatar */}
             {fullPerson.current_residence && (
                 <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white tracking-wide bg-emerald-500/90 backdrop-blur-md w-fit px-2.5 py-1 rounded-md shadow-md border border-emerald-400">
                     <MapPin className="size-3.5 text-white" />
                     <span className="drop-shadow-md">{fullPerson.current_residence}</span>
                 </div>
             )}
          </div>
        </motion.div>
      </div>

      {/* Main Info Section */}
      <div className="pt-20 sm:pt-24 px-6 sm:px-10 relative z-10 flex flex-col md:flex-row gap-8">
        
        {/* Left Column */}
        <div className="flex-1 space-y-8">
            <motion.div variants={itemVariants}>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                    {fullPerson.full_name}
                    {fullPerson.name_tag && (
                        <span className="text-2xl sm:text-3xl font-bold text-stone-400 ml-2">
                           - {fullPerson.name_tag}
                        </span>
                    )}
                    </h1>
                </div>

                {/* Quick Stats & Tags (Club related hashtags) */}
                {(() => {
                    const statusTag = getMemberStatusTag(person.khoa_id, khoas);
                    const myKhoa = khoas?.find(k => k.id === person.khoa_id);
                    const yecGenStr = myKhoa?.yec_generation ? ` - Thế hệ YEC ${myKhoa.yec_generation}` : '';
                    
                    const getCustomStatusColor = (status: string) => {
                       switch(status) {
                          case 'Học ĐH': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
                          case 'Hoạt động CLB': return 'bg-amber-50 text-amber-700 border-amber-200';
                          case 'Du học': return 'bg-purple-50 text-purple-700 border-purple-200';
                          case 'Đi làm': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          case 'Thất nghiệp': return 'bg-rose-50 text-rose-700 border-rose-200';
                          case 'Đã kết hôn': return 'bg-pink-50 text-pink-700 border-pink-200';
                          default: return 'bg-stone-50 text-stone-700 border-stone-200';
                       }
                    };

                    return (
                        <div className="space-y-2 mb-3">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                {fullPerson.status && (
                                   <span className={`inline-flex items-center px-3 py-1.5 rounded-lg border shadow-sm text-sm font-bold tracking-wide ${getCustomStatusColor(fullPerson.status as string)}`}>
                                       #{fullPerson.status}
                                   </span>
                                )}
                                {fullPerson.marital_status && (
                                   <span className={`inline-flex items-center px-3 py-1.5 rounded-lg border shadow-sm text-sm font-bold tracking-wide bg-pink-50 text-pink-700 border-pink-200`}>
                                       ❤️ {fullPerson.marital_status}
                                   </span>
                                )}
                                {currentAge && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200/60 shadow-sm text-sm font-semibold text-stone-700">
                                        🎂 {currentAge} tuổi
                                    </span>
                                )}
                                {fullPerson.industry && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-100 shadow-sm text-sm font-semibold text-sky-800">
                                        Industry: {fullPerson.industry}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Job Title & Company */}
                <div className="flex items-center gap-2 text-stone-600 font-medium text-lg mb-4">
                    <Briefcase className="size-5 text-stone-400 shrink-0" />
                    <span>{fullPerson.occupation || "Chưa cập nhật chuyên môn"}</span>
                    {fullPerson.company && <span className="text-stone-400">@</span>}
                    {fullPerson.company && <span className="font-bold text-stone-800">{fullPerson.company}</span>}
                </div>
            </motion.div>

            {/* BIO / About Me */}
            {(bio || skills.length > 0) && (
                <motion.section variants={itemVariants} className="space-y-6">
                    {bio && (
                        <div>
                            <h2 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                                <span className="text-2xl">👋</span> Giới thiệu bản thân
                            </h2>
                            <div className="bg-white rounded-2xl p-5 border border-stone-200/60 shadow-sm prose prose-stone prose-sm max-w-none">
                                <ReactMarkdown>{bio}</ReactMarkdown>
                            </div>
                        </div>
                    )}


                </motion.section>
            )}

            {/* Club Roles History */}
            {rolesHistory.length > 0 && (
                <motion.section variants={itemVariants}>
                    <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                        <Tag className="size-5 text-amber-500" /> Lịch sử Hoạt động CLB
                    </h2>
                    <div className="flex flex-col gap-2.5">
                        {rolesHistory.map((role, idx) => {
                           return (
                               <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white border border-stone-200/80 p-3.5 rounded-xl hover:border-amber-300 transition-colors shadow-sm gap-2 sm:gap-4">
                                  <div className="flex items-center gap-3">
                                     {role.term && <div className="px-3 py-1 bg-amber-50 text-amber-700 font-black text-[11px] rounded-lg uppercase tracking-wider whitespace-nowrap border border-amber-100">{role.term}</div>}
                                     <div className="font-bold text-stone-700 text-sm whitespace-nowrap">{role.department || "Không thuộc ban"}</div>
                                  </div>
                                  <div className="text-stone-500 text-sm font-medium sm:text-right truncate">
                                     {role.role_title}
                                  </div>
                               </div>
                           );
                        })}
                    </div>
                </motion.section>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
                 <motion.section variants={itemVariants}>
                    <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                        <Award className="size-5 text-amber-500" /> Hành trình YECer
                    </h2>
                    <div className="relative border-l-[2px] border-amber-200 ml-3 sm:ml-4 z-10">
                        <div className="flex flex-col gap-4 max-h-[250px] overflow-y-auto pr-3 sm:pr-4 custom-scrollbar py-1">
                            {achievements.map((ach, i) => {
                                let parsed: any = null;
                                try {
                                    parsed = JSON.parse(ach);
                                    if (typeof parsed !== 'object' || parsed === null) parsed = null;
                                } catch { parsed = null; }

                                const time = parsed?.time || "";
                                const title = parsed?.title || (parsed ? "" : ach); // fallback to raw string if not JSON
                                const description = parsed?.description || "";

                                return (
                                <div key={i} className="relative pl-6 sm:pl-8 group py-1">
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[23px] top-5 size-3.5 rounded-full bg-white border-[3px] border-amber-400 group-hover:border-amber-500 group-hover:scale-125 transition-all duration-300 shadow-sm" />
                                    
                                    <div className="bg-white border border-stone-100/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group-hover:-translate-y-1 hover:border-amber-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                            {time && (
                                                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md shrink-0 border border-amber-200/50">
                                                    {time}
                                                </span>
                                            )}
                                            <h4 className="font-bold text-stone-800 text-[15px] leading-snug">
                                                {title}
                                            </h4>
                                        </div>
                                        {description && (
                                            <div className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap mt-2.5 prose prose-stone prose-sm">
                                                <ReactMarkdown>{description}</ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.section>
            )}
        </div>

        {/* Right Column / Sidebar */}
        <div className="w-full md:w-80 space-y-6 shrink-0">
            {/* Contact / Public */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-5 border border-stone-200/60 shadow-sm flex flex-col gap-3">
                <div className="font-semibold text-stone-800 flex items-center gap-3 bg-stone-50/80 px-4 py-3 rounded-2xl border border-stone-100">
                    <div className="p-2 bg-white rounded-xl shadow-xs shrink-0">
                        <Phone className="size-4 text-stone-500" />
                    </div>
                    <span className="truncate">{fullPerson.phone_number || "Chưa cập nhật"}</span>
                </div>
                {fullPerson.social_link && (
                    <a 
                        href={fullPerson.social_link as string} 
                        target="_blank" 
                        rel="noreferrer"
                        className="font-semibold text-stone-800 flex items-center gap-3 bg-amber-50/50 px-4 py-3 rounded-2xl border border-amber-100/60 hover:bg-amber-100/50 hover:border-amber-200 transition-all group"
                    >
                        <div className="p-2 bg-white rounded-xl shadow-xs text-amber-500 group-hover:text-amber-600 shrink-0 transition-colors">
                            <LinkIcon className="size-4" />
                        </div>
                        <span className="truncate group-hover:text-amber-700 transition-colors">Theo dõi / Trò chuyện</span>
                    </a>
                )}
            </motion.div>

            {/* Looking to connect */}
            {lookingFor.length > 0 && (
                <motion.div variants={itemVariants} className="bg-zinc-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
                        <LinkIcon className="size-5 text-indigo-400" /> Muốn kết nối
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4 relative z-10">
                        Đang tìm kiếm cơ hội giao lưu, hợp tác trong các lĩnh vực:
                    </p>
                    <div className="flex flex-wrap gap-2 relative z-10">
                        {lookingFor.map((tag, i) => (
                            <span key={i} className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-200">
                                {tag}
                            </span>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Skills moved to right column */}
            {skills.length > 0 && (
                <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm">
                    <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                        <Star className="size-5 text-amber-500 fill-amber-500" /> Thế mạnh & Kỹ năng
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, i) => (
                            <span key={i} className="bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl text-sm font-semibold text-stone-700 shadow-sm">
                                {skill}
                            </span>
                        ))}
                    </div>
                </motion.div>
            )}
            

        </div>
      </div>
    </motion.div>
  );
}
