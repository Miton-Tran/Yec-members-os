"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, ArrowLeft, GripVertical } from "lucide-react";
import Link from "next/link";

export interface Milestone {
  id: string;
  title: string;
  period: string;
  description: string;
}

export default function KhoaTimelineEditor({
  khoaId,
  initialSummary,
  initialHighlights,
}: {
  khoaId: string;
  initialSummary: string;
  initialHighlights: any;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [summary, setSummary] = useState(initialSummary || "");
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    if (Array.isArray(initialHighlights)) return initialHighlights;
    return [];
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'error'|'success', text: string} | null>(null);

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { id: Math.random().toString(36).substring(7), title: "", period: "", description: "" }
    ]);
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: string) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from("khoas")
      .update({
         summary,
         highlights: milestones
      })
      .eq("id", khoaId);
      
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: "Lưu nội dung thành công!" });
      router.refresh();
      // maybe delay and redirect
      setTimeout(() => {
          router.push(`/dashboard/lineage/${khoaId}`);
      }, 1500);
    }
    setSaving(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
       
       {/* Actions Header */}
       <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
             <Link href="/dashboard/lineage" className="p-2 -ml-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
                <ArrowLeft className="size-5" />
             </Link>
             <h1 className="text-xl font-bold text-stone-800">Biên tập Timeline Khóa</h1>
          </div>
          <div className="flex items-center gap-3">
             {message && (
                 <span className={`text-sm font-semibold ${message.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {message.text}
                 </span>
             )}
             <button
               disabled={saving}
               onClick={handleSave}
               className="btn-primary flex items-center gap-2"
             >
                <Save className="size-4" />
                {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
             </button>
          </div>
       </div>

       {/* Summary Section */}
       <section className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-800 mb-4">Tổng quan hoạt động nhiệm kỳ (1 - 2 năm trọn vẹn)</h2>
          <textarea 
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full h-32 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none resize-none transition-all"
            placeholder="Viết một đoạn khái quát về tinh thần, bối cảnh và định hướng của Khóa trong suốt nhiệm kỳ..."
          />
       </section>

       {/* Timeline Section */}
       <section className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-lg font-bold text-stone-800">Sự kiện & Dấu mốc lịch sử</h2>
             <button onClick={addMilestone} className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-xl font-semibold text-sm transition-colors">
                <Plus className="size-4" /> Thêm cột mốc
             </button>
          </div>

          <div className="space-y-4">
             {milestones.length === 0 ? (
                <div className="text-center py-10 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                    Chưa có cột mốc nào được tạo.
                </div>
             ) : (
                milestones.map((milestone, index) => (
                   <div key={milestone.id} className="group relative flex items-start gap-4 p-4 bg-stone-50 border border-stone-200 rounded-xl">
                      <div className="mt-2 text-stone-300">
                         <GripVertical className="size-5" />
                      </div>
                      <div className="flex-1 space-y-3">
                         <div className="flex flex-col sm:flex-row gap-3">
                            <input 
                              type="text" 
                              value={milestone.period}
                              onChange={(e) => updateMilestone(milestone.id, 'period', e.target.value)}
                              placeholder="Thời gian (VD: 09/2024)" 
                              className="w-full sm:w-1/3 px-3 py-2 bg-white border border-stone-200 rounded-lg focus:border-amber-400 outline-none font-medium text-stone-700"
                            />
                            <input 
                              type="text" 
                              value={milestone.title}
                              onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                              placeholder="Tên sự kiện / Hoạt động" 
                              className="w-full sm:w-2/3 px-3 py-2 bg-white border border-stone-200 rounded-lg focus:border-amber-400 outline-none font-bold text-stone-800"
                            />
                         </div>
                         <textarea
                            value={milestone.description}
                            onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                            placeholder="Mô tả ngắn gọn về dấu mốc này..."
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:border-amber-400 outline-none text-stone-600 resize-none h-20 text-sm"
                         />
                      </div>
                      <button 
                        onClick={() => removeMilestone(milestone.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      >
                         <Trash2 className="size-5" />
                      </button>
                   </div>
                ))
             )}
          </div>
       </section>
    </div>
  );
}
