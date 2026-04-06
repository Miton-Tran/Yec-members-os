import { Khoa } from "@/types";

export function getMemberStatusTag(khoaId: string | null | undefined, khoas: Khoa[]): { label: string, colorClass: string } | null {
  if (!khoaId || !khoas || khoas.length === 0) return null;

  const targetKhoa = khoas.find((k) => k.id === khoaId);
  if (!targetKhoa || !targetKhoa.year_start) return { label: "Thành viên", colorClass: "bg-stone-500 text-white border-transparent shadow-sm" };

  // Khóa hiện hành = Khóa có year_start lớn nhất
  const maxYear = Math.max(...khoas.map((k) => k.year_start || 0));
  
  const diff = maxYear - targetKhoa.year_start;

  if (diff === 0) {
    return { label: "Thành viên", colorClass: "bg-sky-500 text-white border-transparent shadow-sm" };
  } else if (diff === 1) {
    return { label: "Ban chủ nhiệm", colorClass: "bg-orange-500 text-white border-transparent shadow-sm" };
  } else if (diff === 2 || diff === 3) {
    return { label: "Ban cố vấn", colorClass: "bg-purple-500 text-white border-transparent shadow-sm" };
  } else {
    return { label: "Cựu Thành viên", colorClass: "bg-emerald-600 text-white border-transparent shadow-sm" };
  }
}
