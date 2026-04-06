"use client";

import { createClient } from "@/utils/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Khoa {
  id: string;
  name: string;
  year_start: number | null;
  year_end: number | null;
  summary: string | null;
  yec_generation: number | null;
}

export default function KhoaManager() {
  const supabase = createClient();

  const [khoas, setKhoas] = useState<Khoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [yecGeneration, setYecGeneration] = useState("");
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [summary, setSummary] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchKhoas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("khoas")
      .select("*")
      .order("year_start", { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setKhoas(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKhoas();
  }, []);

  const resetForm = () => {
    setName("");
    setYecGeneration("");
    setYearStart("");
    setYearEnd("");
    setSummary("");
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (khoa: Khoa) => {
    setName(khoa.name);
    setYecGeneration(khoa.yec_generation ? khoa.yec_generation.toString() : "");
    setYearStart(khoa.year_start ? khoa.year_start.toString() : "");
    setYearEnd(khoa.year_end ? khoa.year_end.toString() : "");
    setSummary(khoa.summary || "");
    setEditingId(khoa.id);
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa Khóa này? Hành động này sẽ loại bỏ thông tin liên kết của các thành viên.")) return;
    
    setError(null);
    setSuccess(null);
    const { error } = await supabase.from("khoas").delete().eq("id", id);
    if (error) {
      setError("Lỗi khi xóa: " + error.message);
    } else {
      setSuccess("Đã xóa Khóa thành công.");
      fetchKhoas();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      name,
      yec_generation: yecGeneration ? parseInt(yecGeneration) : null,
      year_start: yearStart ? parseInt(yearStart) : null,
      year_end: yearEnd ? parseInt(yearEnd) : null,
      summary,
    };

    if (isEditing && editingId) {
      const { error } = await supabase
        .from("khoas")
        .update(payload)
        .eq("id", editingId);
      
      if (error) {
        setError("Lỗi khi cập nhật: " + error.message);
      } else {
        setSuccess("Cập nhật Khóa thành công.");
        resetForm();
        fetchKhoas();
      }
    } else {
      const { error } = await supabase.from("khoas").insert(payload);
      if (error) {
        setError("Lỗi khi tạo mới: " + error.message);
      } else {
        setSuccess("Tạo Khóa mới thành công.");
        resetForm();
        fetchKhoas();
      }
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm font-medium"
          >
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-4 text-sm font-semibold"
          >
            <CheckCircle2 className="size-5 shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="w-full lg:w-1/3 border border-stone-200/80 bg-stone-50/50 p-6 rounded-2xl shadow-sm self-start">
            <h3 className="text-lg font-bold text-stone-800 mb-4">{isEditing ? "Cập nhật Khóa" : "Thêm Khóa mới"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="block text-sm font-semibold text-stone-700 mb-1">Tên Khóa <span className="text-red-500">*</span></label>
                       <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ví dụ: K54" className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none" />
                    </div>
                    <div>
                       <label className="block text-sm font-semibold text-stone-700 mb-1">Thế hệ YEC</label>
                       <input type="number" value={yecGeneration} onChange={e => setYecGeneration(e.target.value)} placeholder="Ví dụ: 14" className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="block text-sm font-semibold text-stone-700 mb-1">Năm bắt đầu</label>
                       <input type="number" value={yearStart} onChange={e => setYearStart(e.target.value)} placeholder="2012" className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none" />
                    </div>
                    <div>
                       <label className="block text-sm font-semibold text-stone-700 mb-1">Năm kết thúc</label>
                       <input type="number" value={yearEnd} onChange={e => setYearEnd(e.target.value)} placeholder="2016" className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none" />
                    </div>
                </div>
                <div>
                   <label className="block text-sm font-semibold text-stone-700 mb-1">Mô tả ngắn</label>
                   <textarea rows={3} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Thông tin nổi bật..." className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none resize-none" />
                </div>
                
                <div className="pt-2 flex gap-2">
                    {isEditing && (
                        <button type="button" onClick={resetForm} className="btn-secondary flex-1">Hủy</button>
                    )}
                    <button type="submit" disabled={isSaving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="size-4 animate-spin" /> : (isEditing ? <Edit2 className="size-4" /> : <Plus className="size-4" />)}
                        {isEditing ? "Lưu thay đổi" : "Tạo mới"}
                    </button>
                </div>
            </form>
        </div>

        {/* List */}
        <div className="w-full lg:w-2/3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-stone-500 font-medium">
              Danh sách các thế hệ CLB ({khoas.length} Khóa)
            </p>
            <button
              onClick={fetchKhoas}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              title="Tải lại"
            >
              <RefreshCw className={`size-4 ${loading && 'animate-spin'}`} />
            </button>
          </div>

          <div className="rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                    <tr className="bg-stone-50 border-b border-stone-200/80">
                      <th className="text-left px-5 py-3 font-semibold text-stone-600 whitespace-nowrap">
                        Khóa
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">
                        Nhiệm kỳ
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-stone-600">
                        Thông tin khái quát
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-stone-600">
                        Thao tác
                      </th>
                    </tr>
                </thead>
                <tbody>
                  {khoas.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-stone-500">
                            Chưa có dữ liệu Khóa nào trong hệ thống.
                        </td>
                    </tr>
                  ) : (
                      khoas.map((k) => (
                        <tr
                          key={k.id}
                          className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50 transition-colors"
                        >
                          <td className="px-5 py-4 font-bold text-stone-800">
                            {k.name} {k.yec_generation ? `- Thế hệ Y${k.yec_generation}` : ""}
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-stone-600">
                            {k.year_start || "—"} - {k.year_end || "—"}
                          </td>
                          <td className="px-4 py-4 text-stone-600 text-xs">
                            <span className="line-clamp-2">{k.summary || "Chưa có mô tả"}</span>
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap space-x-2">
                             <Link
                               href={`/dashboard/lineage/${k.id}/edit`}
                               className="p-1.5 inline-flex text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                               title="Soạn thảo Timeline/Blog"
                             >
                                <FileText className="size-4" />
                             </Link>
                             <button
                               onClick={() => handleEdit(k)}
                               className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                               title="Chỉnh sửa chung"
                             >
                                <Edit2 className="size-4" />
                             </button>
                             <button
                               onClick={() => handleDelete(k.id)}
                               className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                               title="Xóa"
                             >
                                <Trash2 className="size-4" />
                             </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
