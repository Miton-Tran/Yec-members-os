"use client";

import { saveMemberAction } from "@/app/actions/profile";
import { Gender, Person, Khoa, ClubRoleHistoryItem } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  AlertCircle,
  Briefcase,
  Image as ImageIcon,
  Loader2,
  Lock,
  MapPin,
  Phone,
  Plus,
  Settings2,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const PREDEFINED_STATUSES = ["Học ĐH", "Hoạt động CLB", "Du học", "Đi làm", "Thất nghiệp", "Khác"];
const PREDEFINED_MARITAL = ["Độc thân", "Đã kết hôn", "Đang hẹn hò", "Khác"];
const PREDEFINED_DEPARTMENTS = ["Ban Chủ nhiệm", "Ban Chuyên môn", "Ban Truyền thông", "Ban Đối ngoại", "Ban Tài chính", "Ban Sự kiện", "Ban Nhân sự", "Không thuộc ban"];


interface MemberFormProps {
  initialData?: Person;
  isEditing?: boolean;
  isAdmin?: boolean;
  /** Called with the saved person's ID after a successful save. Overrides default router.push. */
  onSuccess?: (personId: string) => void;
  /** Called when user clicks Cancel. Overrides default router.back(). */
  onCancel?: () => void;
}

export default function MemberForm({
  initialData,
  isEditing = false,
  isAdmin = false,
  onSuccess,
  onCancel,
}: MemberFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState(initialData?.full_name || "");
  const [otherNames, setOtherNames] = useState(initialData?.other_names || "");
  const [gender, setGender] = useState<Gender>(initialData?.gender || "male");
  const [birthYear, setBirthYear] = useState<number | "">(
    initialData?.birth_year || "",
  );
  const [birthMonth, setBirthMonth] = useState<number | "">(
    initialData?.birth_month || "",
  );
  const [birthDay, setBirthDay] = useState<number | "">(
    initialData?.birth_day || "",
  );
  
  const [khoaId, setKhoaId] = useState(initialData?.khoa_id || "");

  const [clubRolesHistory, setClubRolesHistory] = useState<ClubRoleHistoryItem[]>(() => {
    if (initialData?.club_roles_history && initialData.club_roles_history.length > 0) {
      return initialData.club_roles_history;
    }
    if (initialData?.khoa_id || initialData?.club_role_title) {
       return [{
         term: "",
         role_level: initialData.club_role_level ?? 4,
         department: "",
         role_title: initialData.club_role_title || ""
       }];
    }
    return [{ term: "", role_level: 4, department: "", role_title: "" }];
  });


  const [khoasList, setKhoasList] = useState<Khoa[]>([]);
  useEffect(() => {
    supabase
      .from("khoas")
      .select("*")
      .order("year_start", { ascending: false })
      .then(({ data }) => {
        if (data) setKhoasList(data);
      });
  }, [supabase]);

  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData?.avatar_url || null,
  );

  const [note, setNote] = useState(initialData?.note || "");

  // CV / Club Fields
  const [statusOption, setStatusOption] = useState(() => {
    if (!initialData?.status) return "";
    return PREDEFINED_STATUSES.includes(initialData.status) ? initialData.status : "Khác";
  });
  const [statusCustom, setStatusCustom] = useState(() => {
    if (!initialData?.status) return "";
    return !PREDEFINED_STATUSES.includes(initialData.status) ? initialData.status : "";
  });
  const [nameTag, setNameTag] = useState(initialData?.name_tag || "");

  const [maritalStatusOption, setMaritalStatusOption] = useState(() => {
    if (!initialData?.marital_status) return "";
    return PREDEFINED_MARITAL.includes(initialData.marital_status) ? initialData.marital_status : "Khác";
  });
  const [maritalStatusCustom, setMaritalStatusCustom] = useState(() => {
    if (!initialData?.marital_status) return "";
    return !PREDEFINED_MARITAL.includes(initialData.marital_status) ? initialData.marital_status : "";
  });

  const [bioLong, setBioLong] = useState(initialData?.bio_long || "");
  const [company, setCompany] = useState(initialData?.company || "");
  const [industry, setIndustry] = useState(initialData?.industry || "");
  
  const [skillsStr, setSkillsStr] = useState((initialData?.skills || []).join(", "));
  const [achievementsList, setAchievementsList] = useState<{ time: string; title: string; description: string }[]>(() => {
    const initAchs = initialData?.achievements || [];
    if (initAchs.length === 0) return [{ time: "", title: "", description: "" }];
    return initAchs.map(ach => {
      try {
        const parsed = JSON.parse(ach);
        if (parsed && typeof parsed === 'object') {
          return {
            time: parsed.time || "",
            title: parsed.title || "",
            description: parsed.description || ""
          };
        }
        return { time: "", title: ach, description: "" };
      } catch {
        return { time: "", title: ach, description: "" };
      }
    });
  });
  const [lookingForStr, setLookingForStr] = useState((initialData?.looking_for_connections || []).join(", "));

  // Contact fields (previously private)
  const [phoneNumber, setPhoneNumber] = useState(
    initialData?.phone_number ?? "",
  );
  const [socialLink, setSocialLink] = useState(
    initialData?.social_link ?? "",
  );

  const [occupation, setOccupation] = useState(
    initialData?.occupation ?? "",
  );
  const [currentResidence, setCurrentResidence] = useState(
    initialData?.current_residence ?? "",
  );

  const slugify = (str: string) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    const isValidDate = (
      day: number | "",
      month: number | "",
      year: number | "",
    ) => {
      if (day !== "" && (day < 1 || day > 31)) return false;
      if (month !== "" && (month < 1 || month > 12)) return false;
      if (year !== "" && year < 1) return false;

      if (day !== "" && month !== "") {
        const currentYear = year !== "" ? year : 2000;
        const daysInMonth = new Date(currentYear, month, 0).getDate();
        if (day > daysInMonth) return false;
      }
      return true;
    };

    if (!isValidDate(birthDay, birthMonth, birthYear)) {
      setError("Ngày sinh không hợp lệ. Vui lòng kiểm tra lại.");
      setLoading(false);
      return;
    }

    try {
      let currentAvatarUrl = avatarUrl;

      // Handle Image Upload First
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile);

        if (uploadError) {
          setError("Lỗi khi tải ảnh lên: " + uploadError.message);
          setLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);
          
        currentAvatarUrl = publicUrlData.publicUrl;
      }

      // Update person data helper to avoid duplication
      const getPersonData = (url: string | null) => ({
        full_name: fullName,
        gender,
        birth_year: birthYear === "" ? null : Number(birthYear),
        birth_month: birthMonth === "" ? null : Number(birthMonth),
        birth_day: birthDay === "" ? null : Number(birthDay),
        khoa_id: khoaId || null,
        club_role_level: clubRolesHistory.length > 0 ? clubRolesHistory[0].role_level : 4,
        club_role_title: clubRolesHistory.length > 0 ? clubRolesHistory[0].role_title : null,
        club_roles_history: clubRolesHistory.filter(r => r.term !== ""),

        other_names: otherNames || null,
        avatar_url: url,
        note: note || null,
        user_id: initialData?.user_id || null,

        bio_long: bioLong || null,
        status: statusOption === "Khác" ? (statusCustom || null) : (statusOption || null),
        marital_status: maritalStatusOption === "Khác" ? (maritalStatusCustom || null) : (maritalStatusOption || null),
        name_tag: nameTag || null,
        company: company || null,
        industry: industry || null,
        skills: skillsStr ? skillsStr.split(',').map(s => s.trim()).filter(Boolean) : null,
        achievements: achievementsList.some(a => a.title.trim() || a.description.trim()) 
          ? achievementsList.filter(a => a.title.trim() || a.description.trim()).map(a => JSON.stringify(a))
          : null,
        looking_for_connections: lookingForStr ? lookingForStr.split(',').map(s => s.trim()).filter(Boolean) : null,
        occupation: occupation || null,
        current_residence: currentResidence || null,

        social_link: socialLink || null,
      });

      let currentPersonId = initialData?.id;

      const publicData = getPersonData(currentAvatarUrl || null);
      
      const normalizedPrivateData = {
        phone_number: phoneNumber?.trim() || null,
        occupation: occupation?.trim() || null,
        current_residence: currentResidence?.trim() || null,
      };

      const hasPrivateData =
        normalizedPrivateData.phone_number ||
        normalizedPrivateData.occupation ||
        normalizedPrivateData.current_residence;

      // 3. Save via Action securely
      const result = await saveMemberAction(currentPersonId, publicData, hasPrivateData ? normalizedPrivateData : null);
      currentPersonId = (result.personId as string | undefined) || undefined;

      // After save: use callback if provided, otherwise fall back to page navigation
      if (!currentPersonId)
        throw new Error("Không lấy được ID thành viên sau khi lưu.");
      if (onSuccess) {
        onSuccess(currentPersonId);
      } else {
        router.push("/dashboard/yec-members/" + currentPersonId);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Error saving member:", err);
      // Fallback formatting if it's an object from Supabase Postgres that lacks a 'message'
      const errorMessage = err?.message || err?.details || (typeof err === "object" ? JSON.stringify(err) : String(err)) || "Failed to save member";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formSectionVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const inputClasses =
    "bg-white text-stone-900 placeholder-stone-500 block w-full rounded-xl border border-stone-300 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white text-sm px-4 py-3 transition-all outline-none!";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <motion.div
        variants={formSectionVariants}
        initial="hidden"
        animate="show"
        className="bg-white/80 p-5 sm:p-8 rounded-2xl shadow-sm border border-stone-200/80"
      >
        <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-800 mb-6 border-b border-stone-100 pb-4 flex items-center gap-2">
          <User className="size-5 text-amber-600" />
          Thông tin chung
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              Họ và Tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClasses}
              placeholder="Nhập họ và tên..."
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              Tên gọi khác
            </label>
            <input
              type="text"
              value={otherNames}
              onChange={(e) => setOtherNames(e.target.value)}
              className={inputClasses}
              placeholder="Nickname, tên thánh, bí danh..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              Giới tính <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className={`${inputClasses} appearance-none`}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-500">
                <Settings2 className="size-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              Khóa Sinh viên
            </label>
            <div className="relative">
              <select
                value={khoaId}
                onChange={(e) => setKhoaId(e.target.value)}
                className={`${inputClasses} appearance-none`}
              >
                <option value="">-- Chọn Khóa --</option>
                {khoasList.map((k) => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-500">
                <Settings2 className="size-4" />
              </div>
            </div>
          </div>

          {/* Club Info History */}
          <div className="md:col-span-2 mt-4 border-t border-stone-100 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <label className="block text-sm font-bold text-stone-700">Lịch sử Hoạt động CLB (Nhiệm kỳ & Chức vụ)</label>
              <button
                type="button"
                onClick={() => setClubRolesHistory([...clubRolesHistory, { term: "", role_level: 4, department: "", role_title: "" }])}
                className="px-3 py-1.5 flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-semibold rounded-lg transition-colors border border-amber-200/60 w-fit"
              >
                <Plus className="size-4" />
                Thêm Nhiệm kỳ hoạt động
              </button>
            </div>
            
            <div className="space-y-4">
              {clubRolesHistory.map((role, index) => (
                <div key={index} className="bg-stone-50/80 p-4 sm:p-6 rounded-2xl border border-stone-200 flex flex-col sm:flex-row gap-4 sm:gap-6 relative group transition-all focus-within:border-amber-300">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                        Nhiệm kỳ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 2020-2021"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 bg-white"
                        value={role.term}
                        required
                        onChange={(e) => {
                          const newHistory = [...clubRolesHistory];
                          newHistory[index].term = e.target.value;
                          setClubRolesHistory(newHistory);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                        Phòng / Ban
                      </label>
                      <select
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 bg-white text-sm"
                        value={role.department || ""}
                        onChange={(e) => {
                          const newHistory = [...clubRolesHistory];
                          newHistory[index].department = e.target.value;
                          setClubRolesHistory(newHistory);
                        }}
                      >
                        <option value="">-- Chọn --</option>
                        {PREDEFINED_DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                        Cấp bậc sơ đồ
                      </label>
                      <select
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 bg-white text-sm"
                        value={role.role_level ?? 4}
                        onChange={(e) => {
                          const newHistory = [...clubRolesHistory];
                          newHistory[index].role_level = Number(e.target.value);
                          setClubRolesHistory(newHistory);
                        }}
                      >
                        <option value={0}>Chủ nhiệm</option>
                        <option value={1}>Phó Chủ nhiệm</option>
                        <option value={2}>Trưởng ban / Quản lý</option>
                        <option value={3}>Phó ban</option>
                        <option value={4}>Thành viên</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                        Chức danh cụ thể
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Trưởng ban..."
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 bg-white text-stone-800 text-sm"
                        value={role.role_title}
                        onChange={(e) => {
                          const newHistory = [...clubRolesHistory];
                          newHistory[index].role_title = e.target.value;
                          setClubRolesHistory(newHistory);
                        }}
                      />
                    </div>
                  </div>
                  {clubRolesHistory.length > 1 && (
                    <div className="absolute right-2 top-2 sm:relative sm:right-auto sm:top-auto flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newHistory = clubRolesHistory.filter((_, i) => i !== index);
                          setClubRolesHistory(newHistory);
                        }}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm sm:shadow-none bg-white sm:bg-transparent"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 mt-2">
            <label className="block text-sm font-semibold text-stone-700 mb-2.5">
              Ảnh đại diện
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-stone-50/50 p-4 rounded-xl border border-stone-100">
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-xl font-bold text-white overflow-hidden shrink-0 shadow-md border-4 border-white
                  ${!avatarPreview ? (gender === "male" ? "bg-linear-to-br from-sky-400 to-sky-700" : gender === "female" ? "bg-linear-to-br from-rose-400 to-rose-700" : "bg-linear-to-br from-stone-400 to-stone-600") : ""}`}
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="opacity-90">
                    {fullName ? fullName.charAt(0).toUpperCase() : "?"}
                  </span>
                )}
              </div>
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAvatarFile(file);
                          setAvatarPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0"
                    />
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200/50 hover:bg-amber-100 hover:border-amber-300 transition-colors rounded-lg"
                    >
                      <ImageIcon className="size-4" />
                      Chọn ảnh mới
                    </button>
                  </div>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={async () => {
                        // If there is an existing URL from Supabase, try to extract the file path to delete it
                        if (
                          initialData?.avatar_url &&
                          avatarUrl === initialData.avatar_url
                        ) {
                          try {
                            // Extract just the filename from the end of the URL
                            const fileName = initialData.avatar_url
                              .split("/")
                              .pop();
                            if (fileName) {
                              const { error: removeError } =
                                await supabase.storage
                                  .from("avatars")
                                  .remove([fileName]);
                              if (removeError) {
                                console.error(
                                  "Error removing avatar from storage:",
                                  removeError,
                                );
                              }
                            }
                          } catch (err) {
                            console.error(
                              "Failed to parse avatar URL for deletion",
                              err,
                            );
                          }
                        }

                        setAvatarUrl("");
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      className="flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 font-medium px-4 py-2 border border-rose-200 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="size-4" />
                      Xóa ảnh
                    </button>
                  )}
                </div>
                <p className="mt-2.5 text-xs text-stone-500 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-stone-400" />
                  Hỗ trợ PNG, JPG, GIF tối đa 2MB.
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              Ngày sinh dương lịch
            </label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                placeholder="Ngày"
                min="1"
                max="31"
                value={birthDay}
                onChange={(e) =>
                  setBirthDay(e.target.value ? Number(e.target.value) : "")
                }
                className={inputClasses}
              />
              <input
                type="number"
                placeholder="Tháng"
                min="1"
                max="12"
                value={birthMonth}
                onChange={(e) =>
                  setBirthMonth(e.target.value ? Number(e.target.value) : "")
                }
                className={inputClasses}
              />
              <input
                type="number"
                placeholder="Năm"
                value={birthYear}
                onChange={(e) =>
                  setBirthYear(e.target.value ? Number(e.target.value) : "")
                }
                className={inputClasses}
              />
            </div>
          </div>



          <div className="md:col-span-2 border-t border-stone-100 pt-6 mt-2">
            <h4 className="text-md font-bold text-stone-800 mb-4">Hồ sơ chuyên môn (CV)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Name Tag (Học vị / Danh xưng)</label>
                    <input type="text" value={nameTag} onChange={e => setNameTag(e.target.value)} className={inputClasses} placeholder="Ví dụ: AI Trainer, Du Học Sinh Úc..." />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Trạng thái hiện tại</label>
                    <select
                      value={statusOption}
                      onChange={(e) => setStatusOption(e.target.value)}
                      className={inputClasses}
                    >
                      <option value="">-- Chọn trạng thái --</option>
                      {PREDEFINED_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {statusOption === "Khác" && (
                      <input 
                        type="text" 
                        value={statusCustom} 
                        onChange={e => setStatusCustom(e.target.value)} 
                        className={`mt-2 ${inputClasses}`} 
                        placeholder="Nhập trạng thái của bạn..." 
                      />
                    )}
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Tình trạng mối quan hệ</label>
                    <select
                      value={maritalStatusOption}
                      onChange={(e) => setMaritalStatusOption(e.target.value)}
                      className={inputClasses}
                    >
                      <option value="">-- Chọn --</option>
                      {PREDEFINED_MARITAL.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {maritalStatusOption === "Khác" && (
                      <input 
                        type="text" 
                        value={maritalStatusCustom} 
                        onChange={e => setMaritalStatusCustom(e.target.value)} 
                        className={`mt-2 ${inputClasses}`} 
                        placeholder="Nhập tình trạng..." 
                      />
                    )}
                 </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Công ty / Tổ chức</label>
                <input type="text" value={company} onChange={e => setCompany(e.target.value)} className={inputClasses} placeholder="Tên công ty / Trường học" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Ngành nghề (Industry)</label>
                <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} className={inputClasses} placeholder="Ví dụ: Bất động sản, IT..." />
              </div>
              <div className="md:col-span-2">
                 <label className="block text-sm font-semibold text-stone-700 mb-1.5">Chuyên môn / Vị trí</label>
                 <input type="text" value={occupation} onChange={e => setOccupation(e.target.value)} className={inputClasses} placeholder="Kỹ sư phần mềm, Designer..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Kỹ năng (Cách nhau bằng dấu phẩy)</label>
                <input type="text" value={skillsStr} onChange={e => setSkillsStr(e.target.value)} className={inputClasses} placeholder="React, Marketing, Đàm phán..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Mục tiêu kết nối (Cách nhau bằng dấu phẩy)</label>
                <input type="text" value={lookingForStr} onChange={e => setLookingForStr(e.target.value)} className={inputClasses} placeholder="Tìm đối tác dự án XYZ, Tìm mentor..." />
              </div>
            {/* Hành trình YECer */}
            <div className="md:col-span-2 pt-4 border-t border-stone-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <label className="block text-sm font-semibold text-stone-700">Sự kiện & Dấu mốc lịch sử</label>
                <button
                  type="button"
                  onClick={() => setAchievementsList([...achievementsList, { time: "", title: "", description: "" }])}
                  className="px-3 py-1.5 flex items-center gap-1.5 bg-stone-100/80 hover:bg-stone-200 text-stone-700 text-sm font-semibold rounded-lg transition-colors border border-stone-200/60 w-fit"
                >
                  <Plus className="size-4" />
                  Thêm cột mốc
                </button>
              </div>

              <div className="space-y-4">
                {achievementsList.map((item, index) => (
                  <div key={index} className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row gap-3 sm:gap-4 transition-all focus-within:shadow-sm focus-within:border-emerald-200 relative group">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <input
                            type="text"
                            placeholder="Thời gian (VD: 09/2024)"
                            value={item.time}
                            onChange={(e) => {
                              const newList = [...achievementsList];
                              newList[index].time = e.target.value;
                              setAchievementsList(newList);
                            }}
                            className={inputClasses}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Tên sự kiện / Hoạt động"
                            value={item.title}
                            onChange={(e) => {
                              const newList = [...achievementsList];
                              newList[index].title = e.target.value;
                              setAchievementsList(newList);
                            }}
                            className={inputClasses}
                          />
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Mô tả ngắn gọn về dấu mốc này..."
                        value={item.description}
                        onChange={(e) => {
                          const newList = [...achievementsList];
                          newList[index].description = e.target.value;
                          setAchievementsList(newList);
                        }}
                        className={`${inputClasses} resize-y`}
                      />
                    </div>
                    <div className="absolute right-4 top-4 sm:relative sm:right-auto sm:top-auto flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newList = achievementsList.filter((_, i) => i !== index);
                          setAchievementsList(newList.length ? newList : [{ time: "", title: "", description: "" }]);
                        }}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Giới thiệu bản thân</label>
                <textarea rows={4} value={bioLong} onChange={e => setBioLong(e.target.value)} className={`${inputClasses} resize-y`} placeholder="Đôi nét về kinh nghiệm, sở thích..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Địa chỉ hiện tại</label>
                <input type="text" value={currentResidence} onChange={e => setCurrentResidence(e.target.value)} className={inputClasses} placeholder="Hà Nội, TP.HCM..." />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Information Section (Public) */}
      <motion.div
        variants={formSectionVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.1 }}
        className="bg-stone-50/80 p-5 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm relative overflow-hidden"
      >
        <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-800 mb-6 border-b border-stone-100 pb-4 flex items-center gap-2 relative z-10">
          <Phone className="size-5 text-amber-600" />
          <span>Thông tin liên hệ</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-stone-700 mb-1.5">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Ví dụ: 0912345678"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-stone-700 mb-1.5">
              Link MXH (Facebook / LinkedIn)
            </label>
            <input
              type="url"
              value={socialLink}
              onChange={(e) => setSocialLink(e.target.value)}
              placeholder="https://facebook.com/..."
              className={inputClasses}
            />
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-rose-700 text-sm font-medium bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 shadow-sm"
          >
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={formSectionVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.2 }}
        className="flex justify-end gap-3 sm:gap-4 pt-6"
      >
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.back())}
          className="btn"
        >
          Hủy bỏ
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading
            ? "Đang lưu..."
            : isEditing
              ? "Lưu thay đổi"
              : "Thêm thành viên"}
        </button>
      </motion.div>
    </form>
  );
}
