-- migration_khoa.sql

-- 1. Create the `khoas` table
CREATE TABLE IF NOT EXISTS public.khoas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  year_start INT,
  year_end INT,
  summary TEXT,
  highlights JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS and setup policies
ALTER TABLE public.khoas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.khoas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and Editors can insert khoas" ON public.khoas FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR public.is_editor());
CREATE POLICY "Admins and Editors can update khoas" ON public.khoas FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_editor()) WITH CHECK (public.is_admin() OR public.is_editor());
CREATE POLICY "Admins and Editors can delete khoas" ON public.khoas FOR DELETE TO authenticated USING (public.is_admin() OR public.is_editor());

-- 3. Add trigger for updated_at
CREATE TRIGGER tr_khoas_updated_at BEFORE UPDATE ON public.khoas FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 4. Alter `persons` to add `khoa_id`
ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS khoa_id UUID REFERENCES public.khoas(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_persons_khoa ON public.persons(khoa_id);

-- 5. Seed 3 mock Khoa records
INSERT INTO public.khoas (name, year_start, year_end, summary, highlights) VALUES
('K54', 2012, 2016, 'Khóa sinh viên K54 với nhiều cống hiến đáng tự hào.', '["Vô địch cuộc thi Hành trình Kinh doanh", "Giải nhất Văn nghệ"]'::jsonb),
('K55', 2013, 2017, 'Khóa năng động, nhiệt huyết, tiên phong chuyển đổi số.', '["Mở rộng quy mô Club lớn kỷ lục", "Sáng tạo app nội bộ"]'::jsonb),
('K56', 2014, 2018, 'Thế hệ lãnh đạo mới, đưa CLB vươn tầm quốc tế.', '["Tổ chức thành công hội thảo ASEAN", "Kết nối doanh nghiệp lớn"]'::jsonb);
