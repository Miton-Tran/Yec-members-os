import ClubStats from "@/components/ClubStats";
import { getSupabase } from "@/utils/supabase/queries";

export const metadata = {
  title: "Thống kê CLB YEC",
};

export default async function StatsPage() {
  const supabase = await getSupabase();

  const { data: persons } = await supabase.from("persons").select("*");
  const { data: khoas } = await supabase.from("khoas").select("*").order("year_start", { ascending: false });

  return (
    <div className="flex-1 w-full relative flex flex-col pb-12">
      <div className="w-full relative z-20 py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="title">Thống kê CLB</h1>
        <p className="text-stone-500 mt-1 text-sm">
          Tổng quan số liệu và tình trạng trạng thái của các thành viên từng Khóa
        </p>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <ClubStats
          persons={persons ?? []}
          khoas={khoas ?? []}
        />
      </main>
    </div>
  );
}
