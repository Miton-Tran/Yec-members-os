import { getIsAdmin, getSupabase } from "@/utils/supabase/queries";
import {
  ArrowRight,
  BarChart2,
  CalendarDays,
  Database,
  Network,
  Star,
  Users,
  Search,
  UserCircle
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

/* ── Event type helpers ───────────────────────────────────────────── */
const eventTypeConfig = {
  custom_event: {
    icon: Star,
    label: "Sự kiện",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
};

export default async function DashboardLaunchpad() {
  const isAdmin = await getIsAdmin();
  const supabase = await getSupabase();

  /* ── Fetch events data ────────────────────────────────────────── */
  const { data: customEvents } = await supabase
    .from("custom_events")
    .select("id, name, content, event_date, location, created_by")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(5);

  const upcomingEvents = customEvents || [];

  const today = new Date();
  const solarStr = format(today, "EEEE, dd 'tháng' M, yyyy", { locale: vi });

  /* ── Feature lists ────────────────────────────────────────────── */
  const publicFeatures = [
    {
      title: "Cây Tổ Chức",
      description: "Xem lại bộ máy hoạt động CLB theo các nhiệm kỳ",
      icon: <Network className="size-8 text-amber-600" />,
      href: "/dashboard/yec-tree-members",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200/60",
      hoverColor: "hover:border-amber-400 hover:shadow-amber-100",
    },
    {
      title: "Thành Viên YEC",
      description: "Quản lý và xem lịch sử CLB theo các Khóa",
      icon: <Users className="size-8 text-blue-600" />,
      href: "/dashboard/yec-members",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200/60",
      hoverColor: "hover:border-blue-400 hover:shadow-blue-100",
    },
    {
      title: "Tìm kiếm & Kết nối",
      description: "Tra cứu thành viên, chuyên môn và kỹ năng dự án",
      icon: <Search className="size-8 text-emerald-600" />,
      href: "/dashboard/search",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200/60",
      hoverColor: "hover:border-emerald-400 hover:shadow-emerald-100",
    },
    {
      title: "Hồ Sơ Của Tôi",
      description: "Cập nhật CV, kinh nghiệm để dễ dàng kết nối",
      icon: <UserCircle className="size-8 text-emerald-600" />,
      href: "/dashboard/profile",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200/60",
      hoverColor: "hover:border-emerald-400 hover:shadow-emerald-100",
    },
    {
      title: "Thống kê CLB",
      description: "Tổng quan dữ liệu và hệ sinh thái thành viên",
      icon: <BarChart2 className="size-8 text-purple-600" />,
      href: "/dashboard/stats",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200/60",
      hoverColor: "hover:border-purple-400 hover:shadow-purple-100",
    },
  ];

  const adminFeatures = [
    {
      title: "Quản lý Thành viên",
      description: "Phê duyệt tài khoản và phân quyền",
      icon: <Users className="size-8 text-rose-600" />,
      href: "/dashboard/users",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200/60",
      hoverColor: "hover:border-rose-400 hover:shadow-rose-100",
    },
    {
      title: "Quản lý Khóa",
      description: "Tạo thẻ và cấu hình các thế hệ YEC",
      icon: <Network className="size-8 text-indigo-600" />,
      href: "/dashboard/lineage",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200/60",
      hoverColor: "hover:border-indigo-400 hover:shadow-indigo-100",
    },
    {
      title: "Sao lưu & Phục hồi",
      description: "Xuất/Nhập dữ liệu toàn hệ thống",
      icon: <Database className="size-8 text-teal-600" />,
      href: "/dashboard/data",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200/60",
      hoverColor: "hover:border-teal-400 hover:shadow-teal-100",
    },
  ];

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* ── Today's Date & Upcoming Events ─────────────────── */}
      <Link
        href="/dashboard/events"
        className="group relative block overflow-hidden rounded-3xl bg-white border border-stone-200/60 shadow-sm hover:shadow-stone-100 hover:border-stone-400 mb-10 transition-all duration-300 hover:-translate-y-1"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50"></div>

        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8 items-center">
          {/* Date section */}
          <div className="md:w-[35%] w-full flex flex-col items-center md:items-start text-center md:text-left gap-4 md:border-r border-stone-100 md:pr-8">
            <div className="size-16 rounded-2xl bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100 shadow-sm text-stone-600 transition-transform duration-500 group-hover:scale-105 group-hover:shadow-md group-hover:border-stone-200">
              <CalendarDays className="size-7" />
            </div>
            <div className="mt-1">
              <p className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight capitalize">
                {solarStr}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-50 border border-stone-100">
                <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                  YEC MEMBERS PORTAL
                </span>
              </div>
            </div>
          </div>

          {/* Events summary */}
          <div className="md:w-[65%] w-full flex-1">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-500 uppercase tracking-widest flex items-center gap-2.5">
                    <span className="relative flex size-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-2 bg-amber-500"></span>
                    </span>
                    Sự kiện sắp tới ({upcomingEvents.length})
                  </p>
                  <ArrowRight className="size-5 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {upcomingEvents.slice(0, 4).map((evt: any, i: number) => {
                    const Icon = eventTypeConfig.custom_event.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-50/50 hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all duration-300 cursor-pointer"
                      >
                        <div
                          className={`size-10 rounded-xl ${eventTypeConfig.custom_event.bg} flex items-center justify-center shrink-0 shadow-sm border border-white`}
                        >
                          <Icon className={`size-4 ${eventTypeConfig.custom_event.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-semibold text-stone-700 truncate block">
                            {evt.name}
                          </span>
                          <span className="text-xs text-stone-500 font-medium pt-0.5 block">
                            {format(new Date(evt.event_date), "dd/MM/yyyy", { locale: vi })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 opacity-80 py-6">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-stone-400 transition-transform duration-500 group-hover:scale-105 group-hover:text-stone-500">
                  <CalendarDays className="size-6" />
                </div>
                <p className="text-stone-500 text-center font-medium px-4">
                  Không có sự kiện mới được cập nhật.
                </p>
                <div className="flex items-center gap-2 text-sm text-stone-400 mt-1 font-medium group-hover:text-stone-600 transition-colors">
                  <span>Tạo sự kiện mới</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* ── Feature Grid ──────────────────────────────────── */}
      <div className="space-y-12">
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {publicFeatures.map((feat) => (
              <Link
                key={feat.href}
                href={feat.href}
                className={`group flex flex-col p-6 rounded-2xl bg-white border ${feat.borderColor} ${feat.hoverColor} transition-all duration-300 hover:-translate-y-1 shadow-sm`}
              >
                <div
                  className={`size-14 rounded-xl flex items-center justify-center mb-5 ${feat.bgColor} transition-colors duration-300 group-hover:bg-white border border-transparent group-hover:${feat.borderColor}`}
                >
                  {feat.icon}
                </div>
                <h4 className="text-lg font-bold text-stone-800 mb-2 group-hover:text-amber-700 transition-colors">
                  {feat.title}
                </h4>
                <p className="text-sm text-stone-500 line-clamp-2">
                  {feat.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {isAdmin && (
          <section>
            <h3 className="text-xl font-serif font-bold text-rose-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-px bg-rose-200 rounded-full"></span>
              Quản trị viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {adminFeatures.map((feat) => (
                <Link
                  key={feat.href}
                  href={feat.href}
                  className={`group flex flex-col p-6 rounded-2xl bg-white border ${feat.borderColor} ${feat.hoverColor} transition-all duration-300 hover:-translate-y-1 shadow-sm`}
                >
                  <div
                    className={`size-14 rounded-xl flex items-center justify-center mb-5 ${feat.bgColor} transition-colors duration-300 group-hover:bg-white border border-transparent group-hover:${feat.borderColor}`}
                  >
                    {feat.icon}
                  </div>
                  <h4 className="text-lg font-bold text-stone-800 mb-2 group-hover:text-rose-700 transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-sm text-stone-500 line-clamp-2">
                    {feat.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
