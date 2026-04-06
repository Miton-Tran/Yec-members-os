-- migration_club_roles.sql

-- 1. Bổ sung các cột mới vào bảng persons
ALTER TABLE public.persons 
ADD COLUMN IF NOT EXISTS club_role_level INT DEFAULT 4, -- 0: Chủ nhiệm, 1: Phó CN, 2: Trưởng ban, 3: Phó ban, 4: Thành viên, 5: Khác
ADD COLUMN IF NOT EXISTS club_role_title TEXT; -- VD: "Phó Chủ Nhiệm Đối nội"

-- Update existing defaults
UPDATE public.persons 
SET club_role_title = 'Thành viên'
WHERE club_role_title IS NULL;
