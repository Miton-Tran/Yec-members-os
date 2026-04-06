import { getSupabase } from "@/utils/supabase/queries";
import MemberSearchClient from "./MemberSearchClient";

export default async function SearchPage() {
  const supabase = await getSupabase();

  // Fetch all active records across the club.
  // In a massive system, this would be paginated or use a Supabase RPC / Text Search.
  // For standard club size (< 5000), client side filtering provides the best UX.
  const { data: persons } = await supabase
    .from("persons")
    .select(
      "id, full_name, company, industry, skills, occupation, current_residence, avatar_url, khoa_id, achievements"
    )
    .order("full_name", { ascending: true });

  const { data: khoas } = await supabase
    .from("khoas")
    .select("id, name");

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-stone-800">
          Danh bạ & Tìm kiếm
        </h1>
        <p className="mt-2 text-stone-500">
          Tìm kiếm thành viên chuyên môn, đối tác dự án qua bộ lọc kỹ năng và ngành nghề.
        </p>
      </div>

      <MemberSearchClient persons={persons || []} khoas={khoas || []} />
    </div>
  );
}
