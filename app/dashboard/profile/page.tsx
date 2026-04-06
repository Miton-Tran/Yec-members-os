import { getSupabase } from "@/utils/supabase/queries";
import { redirect } from "next/navigation";
import ProfileSetupFlow from "./ProfileSetupFlow";

export default async function MyProfilePage() {
  const supabase = await getSupabase();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  // Find if person exists
  const { data: person } = await supabase
    .from("persons")
    .select("id")
    .eq("user_id", authData.user.id)
    .single();

  if (person) {
    // If they already have a profile, just take them to their view page
    redirect(`/dashboard/yec-members/${person.id}`);
  }

  // If no person, they need to create one!
  // Grab name & khoa from auth metadata
  const metadata = authData.user.user_metadata || {};
  const initialData = {
    full_name: metadata.full_name || "",
    khoa_id: metadata.khoa_id || "",
    user_id: authData.user.id,
  };

  // Check if they currently have a pending link request
  const { data: requestRes } = await supabase
    .from("edit_requests")
    .select("id")
    .eq("requested_by", authData.user.id)
    .eq("status", "pending")
    .eq("changes->>action", "LINK_PROFILE")
    .limit(1);
    
  const hasPendingRequest = (requestRes?.length ?? 0) > 0;

  // Load all unlinked profiles to populate the dropdown
  // We join with khoas to get the khoa_name to help users identify themselves
  const { data: unlinkedPersons } = await supabase
    .from("persons")
    .select(`
      id, 
      full_name,
      khoa_id,
      khoas ( name )
    `)
    .is("user_id", null);

  const formattedUnlinkedPersons = (unlinkedPersons || []).map(p => ({
      id: p.id,
      full_name: p.full_name,
      khoa_name: (p.khoas as any)?.name || ""
  })).sort((a, b) => a.full_name.localeCompare(b.full_name));

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <h1 className="text-2xl font-black text-stone-900 mb-2">Tạo Hồ Sơ Của Tôi</h1>
      <p className="text-stone-600 mb-8 max-w-2xl">
        Chào mừng bạn đến với mạng lưới câu lạc bộ! Hãy dành vài phút hoàn thiện hồ sơ sinh hoạt của bạn. Các thông tin này sẽ giúp mọi thành viên khác kết nối với bạn một cách hiệu quả nhất.
      </p>
      
      <ProfileSetupFlow 
        initialData={initialData} 
        unlinkedPersons={formattedUnlinkedPersons} 
        hasPendingRequest={hasPendingRequest}
      />
    </div>
  );
}
