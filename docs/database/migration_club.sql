-- migration_club.sql

-- 1. Bổ sung các cột mới vào bảng persons (cập nhật từ cấu trúc CV)
ALTER TABLE public.persons 
ADD COLUMN IF NOT EXISTS bio_long TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS looking_for_connections JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS current_residence TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Chuyển đổi data hiện tại: Nếu bạn đã lưu occupation và current_residence 
-- trong person_details_private, query dưới đây sẽ merge chúng công khai qua bảng persons.
UPDATE public.persons p
SET 
  occupation = pr.occupation,
  current_residence = pr.current_residence
FROM public.person_details_private pr
WHERE p.id = pr.person_id;

-- 3. Tạo bảng edit_requests
CREATE TABLE IF NOT EXISTS public.edit_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID REFERENCES public.persons(id) ON DELETE CASCADE NOT NULL,
  requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  changes JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Edit Requests
ALTER TABLE public.edit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create edit requests" ON public.edit_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requested_by OR public.is_admin() OR public.is_editor());
CREATE POLICY "Admins can view all edit requests" ON public.edit_requests FOR SELECT TO authenticated USING (public.is_admin() OR public.is_editor() OR auth.uid() = requested_by);
CREATE POLICY "Admins can manage edit requests" ON public.edit_requests FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_editor());
CREATE POLICY "Admins can delete edit requests" ON public.edit_requests FOR DELETE TO authenticated USING (public.is_admin() OR public.is_editor());

-- Triggers for edit_requests
CREATE TRIGGER tr_edit_requests_updated_at BEFORE UPDATE ON public.edit_requests FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
