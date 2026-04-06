"use server";

import { getSupabase } from "@/utils/supabase/queries";
import { getSupabaseAdmin } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Submit a request to link the logged-in user to an existing profile.
 */
export async function submitLinkRequest(personId: string) {
  const supabase = await getSupabase();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("Unauthorized");
  }

  // 1. Verify that the requested person currently doesn't have an owner.
  const adminClient = getSupabaseAdmin();
  const { data: person, error: personError } = await adminClient
    .from("persons")
    .select("id, user_id, full_name")
    .eq("id", personId)
    .single();

  if (personError || !person) {
    throw new Error("Không tìm thấy hồ sơ.");
  }

  if (person.user_id) {
    throw new Error("Hồ sơ này đã được liên kết với một tài khoản khác.");
  }

  // 2. Insert into edit_requests
  const { error: reqError } = await adminClient.from("edit_requests").insert({
    person_id: person.id,
    requested_by: authData.user.id,
    changes: { action: "LINK_PROFILE" },
    status: "pending",
  });

  if (reqError) {
    throw new Error("Lỗi khi tạo yêu cầu liên kết.");
  }

  revalidatePath("/dashboard/profile");
  return { success: true };
}

/**
 * Admin action to resolve a link request (Approve/Reject)
 */
export async function resolveLinkRequest(requestId: string, isApproved: boolean) {
  const supabase = await getSupabase();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "editor") {
    throw new Error("Permission denied. Admin/Editor only.");
  }

  const adminClient = getSupabaseAdmin();

  // Load the request
  const { data: req, error: reqError } = await adminClient
    .from("edit_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (reqError || !req) {
    throw new Error("Không tìm thấy yêu cầu.");
  }

  if (req.status !== "pending") {
    throw new Error("Yêu cầu này đã được xử lý.");
  }

  if (isApproved) {
    // Check if the person is still unlinked
    const { data: currentPerson } = await adminClient
      .from("persons")
      .select("user_id")
      .eq("id", req.person_id)
      .single();

    if (currentPerson?.user_id) {
        // Discard the request because it was already taken
        await adminClient.from("edit_requests").update({ status: "rejected" }).eq("id", requestId);
        throw new Error("Hồ sơ này vừa mới được ai đó sở hữu rồi.");
    }

    // Approve: Update the user_id in the persons table
    const { error: updateError } = await adminClient
      .from("persons")
      .update({ user_id: req.requested_by })
      .eq("id", req.person_id);

    if (updateError) throw new Error("Chấp thuận thất bại: Lỗi cơ sở dữ liệu.");

    // Update request state
    await adminClient.from("edit_requests").update({ status: "approved" }).eq("id", requestId);
  } else {
    // Reject
    await adminClient.from("edit_requests").update({ status: "rejected" }).eq("id", requestId);
  }

  revalidatePath("/dashboard/requests");
  return { success: true };
}

/**
 * Universal Server Action to save Profile data bypassing Database RLS blocks.
 * Validates ownership or Admin/Editor privileges before updating.
 */
export async function saveMemberAction(
  personId: string | null | undefined,
  publicData: any,
  privateData: any | null
) {
  const supabase = await getSupabase();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    throw new Error("Unauthorized");
  }

  // Authorize: Admin/Editor OR Owner
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const isAdminOrEditor = profile?.role === "admin" || profile?.role === "editor";

  // If the user is just a member, we must ensure they are the owner of the target profile OR they are creating a new one?
  // Wait, if personId is defined, verify ownership!
  const adminClient = getSupabaseAdmin();
  if (personId && !isAdminOrEditor) {
    const { data: targetPerson } = await adminClient
      .from("persons")
      .select("user_id")
      .eq("id", personId)
      .single();

    if (targetPerson?.user_id !== authData.user.id) {
       throw new Error("Tài khoản của bạn không được uỷ quyền để sửa hồ sơ người khác.");
    }
  }

  let finalPersonId = personId;

  // 1. Upsert/Insert Public Data
  if (personId) {
    const { error } = await adminClient
      .from("persons")
      .update(publicData)
      .eq("id", personId);
    if (error) throw new Error("Database error (Public): " + error.message);
  } else {
    const { data, error } = await adminClient
      .from("persons")
      .insert(publicData)
      .select()
      .single();
    if (error) throw new Error("Database error (Insert): " + error.message);
    finalPersonId = data.id;
  }

  // 2. Upsert Private Data
  if (finalPersonId) {
    if (privateData) {
      privateData.person_id = finalPersonId;
      const { error } = await adminClient
        .from("person_details_private")
        .upsert(privateData);
      
      if (error) throw new Error("Database error (Private): " + error.message);
    } else {
      await adminClient
        .from("person_details_private")
        .delete()
        .eq("person_id", finalPersonId);
    }
  }

  revalidatePath("/", "layout"); // Refresh everything aggressively
  return { success: true, personId: finalPersonId };
}

