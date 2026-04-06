-- migration_status.sql
-- Thêm các trường hỗ trợ CV (Trạng thái và Danh xưng)

ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS name_tag TEXT;
ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS marital_status TEXT;
