import KhoaManager from "@/components/KhoaManager";
import { getProfile } from "@/utils/supabase/queries";
import { redirect } from "next/navigation";

export default async function LineagePage() {
  const profile = await getProfile();

  if (profile?.role !== "admin" && profile?.role !== "editor") {
    redirect("/dashboard");
  }

  return (
    <main className="flex-1 overflow-auto bg-stone-50/50 flex flex-col pt-8 relative w-full">
      <div className="max-w-7xl mx-auto px-4 pb-8 sm:px-6 lg:px-8 w-full relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="title">Quản lý Khóa (Thế hệ)</h1>
          <p className="text-stone-500 mt-2 text-sm sm:text-base max-w-2xl">
            Khai báo và quản lý danh sách các <strong className="text-stone-700">Khóa hoạt động</strong> của Hệ thống YEC. Các Khóa này sẽ được dùng để phân loại và xây dựng hệ thống Cây Tổ Chức CLB.
          </p>
        </div>

        {/* Manager */}
        <div className="bg-white/80 rounded-2xl border border-stone-200/60 shadow-sm p-5 sm:p-8">
          <KhoaManager />
        </div>
      </div>
    </main>
  );
}
