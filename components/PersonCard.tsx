"use client";

import { Khoa, Person } from "@/types";
import { getAvatarBg } from "@/utils/styleHelprs";
import { getMemberStatusTag } from "@/utils/clubLogic";
import Image from "next/image";
import { useDashboard } from "./DashboardContext";
import DefaultAvatar from "./DefaultAvatar";
import { FemaleIcon, MaleIcon } from "./GenderIcons";

interface PersonCardProps {
  person: Person;
  khoas?: Khoa[];
}

export default function PersonCard({ person, khoas = [] }: PersonCardProps) {
  const { setMemberModalId } = useDashboard();

  const isDeceased = person.is_deceased;
  const statusTag = getMemberStatusTag(person.khoa_id, khoas);

  return (
    <button
      onClick={() => setMemberModalId(person.id)}
      className={`group block relative bg-white/60 p-2 sm:p-4 rounded-2xl shadow-sm border border-stone-200/60 hover:border-amber-300 hover:shadow-md hover:bg-white/90 transition-all duration-300 overflow-hidden
        ${isDeceased ? "opacity-80 grayscale" : ""}`}
    >
      {/* Decorative gradient blob */}
      {/* <div
        className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[50px] opacity-20 transition-all duration-500 group-hover:opacity-40 group-hover:scale-125 ${person.gender === "male" ? "bg-sky-400" : person.gender === "female" ? "bg-rose-400" : "bg-stone-400"}`}
      /> */}

      <div className="flex items-center space-x-4 relative z-10">
        <div className="relative">
          <div
            className={`size-14 sm:size-16 rounded-full flex items-center justify-center text-xl font-bold text-white overflow-hidden shrink-0 shadow-lg ring-2 ring-white transition-transform duration-300 group-hover:scale-105
            ${getAvatarBg(person.gender)}`}
          >
            {person.avatar_url ? (
              <Image
                unoptimized
                src={person.avatar_url}
                alt={person.full_name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <DefaultAvatar gender={person.gender} size={64} />
            )}
          </div>
          {/* Gender Indicator Icon */}
          <div
            className={`absolute -bottom-1 -right-1 size-5 sm:size-6 rounded-full ring-2 ring-white shadow-sm flex items-center justify-center ${person.gender === "male" ? "bg-sky-100 text-sky-600" : person.gender === "female" ? "bg-rose-100 text-rose-600" : "bg-stone-100 text-stone-600"}`}
          >
            {person.gender === "male" ? (
              <MaleIcon className="size-3 lg:size-3.5" />
            ) : person.gender === "female" ? (
              <FemaleIcon className="size-3 lg:size-3.5" />
            ) : null}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors truncate mb-2 text-left">
            {person.full_name}
          </h3>
          
          <div className="space-y-1.5 w-full text-left">
            {/* Status Tag & Role Tag */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {statusTag && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block ${statusTag.colorClass}`}>
                  {statusTag.label}
                </span>
              )}
              {person.club_role_title && person.club_role_title !== "Thành viên" && (
                <span className="bg-amber-100/50 text-amber-700 border border-amber-200/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block">
                  {person.club_role_title}
                </span>
              )}
            </div>

            {/* Khóa */}
            {person.khoa_id && khoas.find(k => k.id === person.khoa_id) && (
              <p className="text-xs font-semibold text-stone-500 truncate flex items-center gap-1.5">
                <span className="bg-stone-100 text-stone-700 border border-stone-200 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                  Khóa
                </span>
                {khoas.find(k => k.id === person.khoa_id)?.name}
              </p>
            )}

            {/* Occupation */}
            <p className="text-xs font-medium text-stone-500 truncate flex items-center gap-1.5">
              <svg className="size-3.5 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{person.occupation || "Chưa cập nhật công việc"}</span>
            </p>

            {/* Residence */}
            <p className="text-xs font-medium text-stone-500 truncate flex items-center gap-1.5">
              <svg className="size-3.5 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{person.current_residence || "Chưa cập nhật nơi ở"}</span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest group-hover:text-amber-700">
              Xem hồ sơ →
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
