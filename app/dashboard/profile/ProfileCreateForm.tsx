"use client";

import MemberForm from "@/components/MemberForm";
import { Person } from "@/types";

interface ProfileCreateFormProps {
  initialData: Partial<Person>;
}

export default function ProfileCreateForm({ initialData }: ProfileCreateFormProps) {
  return (
    <MemberForm
      initialData={initialData as any}
      isEditing={false}
      isAdmin={false}
    />
  );
}
