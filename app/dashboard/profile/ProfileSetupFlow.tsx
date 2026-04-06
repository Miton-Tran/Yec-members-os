"use client";

import { useState } from "react";
import ProfileCreateForm from "./ProfileCreateForm";
import { Person } from "@/types";
import { User, Link as LinkIcon, Search, CheckCircle2, Clock } from "lucide-react";
import { submitLinkRequest } from "@/app/actions/profile";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileSetupFlowProps {
  initialData: Partial<Person>;
  unlinkedPersons: { id: string; full_name: string; khoa_name?: string }[];
  hasPendingRequest: boolean;
}

export default function ProfileSetupFlow({
  initialData,
  unlinkedPersons,
  hasPendingRequest,
}: ProfileSetupFlowProps) {
  const [activeTab, setActiveTab] = useState<"create" | "link">("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // If user already submitted a request
  if (hasPendingRequest) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-8 sm:p-12 text-center max-w-2xl mx-auto">
        <div className="size-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="size-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-3">
          Yêu cầu đang chờ phê duyệt
        </h2>
        <p className="text-stone-600 mb-6">
          Bạn đã gửi yêu cầu liên kết hồ sơ. Ban Quản Trị câu lạc bộ sẽ xem xét và phê duyệt trong thời gian sớm nhất. Xin vui lòng chờ đợi.
        </p>
      </div>
    );
  }

  const filteredPersons = unlinkedPersons.filter((p) =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLinkRequest = async () => {
    if (!selectedPersonId) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      await submitLinkRequest(selectedPersonId);
      setMessage({ type: 'success', text: "Đã gửi yêu cầu liên kết. Vui lòng đợi phê duyệt!" });
      // The page will update automatically if revalidatePath triggers correctly, 
      // but showing success state is good.
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Đã xảy ra lỗi." });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex bg-stone-100/80 p-1.5 rounded-xl sm:rounded-full w-full max-w-sm mb-8 relative border border-stone-200/50">
        <div
          className={`absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-white shadow-sm rounded-lg sm:rounded-full transition-transform duration-300 ease-out border border-stone-200/60`}
          style={{
            transform: activeTab === "link" ? "translateX(100%)" : "translateX(0)",
          }}
        />
        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold sm:rounded-full relative z-10 transition-colors ${
            activeTab === "create" ? "text-stone-900" : "text-stone-500 hover:text-stone-700"
          }`}
        >
          <User className="size-4" /> Tạo mới
        </button>
        <button
          onClick={() => setActiveTab("link")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold sm:rounded-full relative z-10 transition-colors ${
            activeTab === "link" ? "text-stone-900" : "text-stone-500 hover:text-stone-700"
          }`}
        >
          <LinkIcon className="size-4" /> Liên kết hồ sơ
        </button>
      </div>

      {activeTab === "create" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ProfileCreateForm initialData={initialData} />
        </motion.div>
      )}

      {activeTab === "link" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/60"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-stone-900 mb-2">
              Tìm và Liên kết với Hồ sơ có sẵn
            </h3>
            <p className="text-stone-600 text-sm">
              Nếu thông tin của bạn đã được Admin tạo trước, hãy tìm kiếm và yêu cầu nhận hồ sơ của bạn.
            </p>
          </div>

          <div className="relative mb-6 text-stone-600 focus-within:text-amber-600 transition-colors">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5" />
            <input
              type="text"
              placeholder="Nhập tên của bạn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all font-medium text-stone-800 placeholder:text-stone-400"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto mb-6 custom-scrollbar border border-stone-100 rounded-xl">
            {filteredPersons.length === 0 ? (
              <div className="text-center py-8 text-stone-500 bg-stone-50">
                Không tìm thấy hồ sơ nào phù hợp.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {filteredPersons.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => setSelectedPersonId(person.id)}
                    className={`w-full text-left p-4 flex items-center justify-between hover:bg-amber-50/50 transition-colors ${
                      selectedPersonId === person.id ? "bg-amber-50" : ""
                    }`}
                  >
                    <div>
                      <p className="font-bold text-stone-800">{person.full_name}</p>
                      <p className="text-sm text-stone-500 font-medium">
                        {person.khoa_name || "Chưa cập nhật khóa"}
                      </p>
                    </div>
                    {selectedPersonId === person.id && (
                      <CheckCircle2 className="size-6 text-amber-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
            <button
              onClick={handleLinkRequest}
              disabled={!selectedPersonId || isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu Khớp nối"}
            </button>
          </div>

          <AnimatePresence>
            {message && (
                <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 p-4 rounded-xl text-sm font-medium ${
                    message.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
                >
                {message.text}
                </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
