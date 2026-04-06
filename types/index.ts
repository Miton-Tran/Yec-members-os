export type Gender = "male" | "female" | "other";
export type RelationshipType =
  | "marriage"
  | "biological_child"
  | "adopted_child";
export type UserRole = "admin" | "editor" | "member";

export interface Profile {
  id: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUserData {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Person {
  id: string;
  full_name: string;
  gender: Gender;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  death_year: number | null;
  death_month: number | null;
  death_day: number | null;
  avatar_url: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;

  // Private fields (optional, as they might not be returned for members)
  phone_number?: string | null;
  occupation?: string | null;
  current_residence?: string | null;

  // Lunar Date
  death_lunar_year: number | null;
  death_lunar_month: number | null;
  death_lunar_day: number | null;

  // New fields
  is_deceased: boolean;
  is_in_law: boolean;
  birth_order: number | null;
  generation: number | null;
  other_names: string | null;
  khoa_id?: string | null;

  // CV / Club specific fields
  bio_long?: string | null;
  company?: string | null;
  industry?: string | null;
  skills?: string[] | null;
  achievements?: string[] | null;
  looking_for_connections?: string[] | null;
  user_id?: string | null;
  social_link?: string | null;

  club_role_level?: number | null;
  club_role_title?: string | null;

  // New CV fields
  status?: string | null;
  name_tag?: string | null;
  marital_status?: string | null;
  yec_status?: string | null;

  club_roles_history?: ClubRoleHistoryItem[] | null;
}

export interface ClubRoleHistoryItem {
  khoa_id?: string | null;
  khoa_name?: string;
  term: string;
  role_level: number | null;
  department?: string;
  role_title: string;
  yec_status?: string;
}

export interface EditRequest {
  id: string;
  person_id: string;
  requested_by: string;
  changes: any;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface Khoa {
  id: string;
  name: string;
  year_start: number | null;
  year_end: number | null;
  summary: string | null;
  highlights: any | null;
  yec_generation?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Relationship {
  id: string;
  type: RelationshipType;
  person_a: string; // UUID
  person_b: string; // UUID
  note?: string | null;
  created_at: string;
  updated_at: string;
}

// Helper types for UI
export interface PersonWithDetails extends Person {
  spouses?: Person[];
  children?: Person[];
  parents?: Person[];
}
