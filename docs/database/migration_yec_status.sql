-- Thêm trường yec_status để phục vụ dropdown chọn (Thành Viên, Ban Cố Vấn, Cựu Thành Viên) cho YEC Club 
ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS yec_status TEXT;
