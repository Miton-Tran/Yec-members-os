"use client";

import { useState } from "react";
import { resolveLinkRequest } from "@/app/actions/profile";

import { CheckCircle2, XCircle, Clock, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RequestItem {
  id: string;
  requested_by: string;
  created_at: string;
  persons?: {
    id: string;
    full_name: string;
    khoas?: { name: string; yec_generation: number | null };
  };
}

export default function RequestsList({ requests }: { requests: any[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleResolve = async (reqId: string, isApproved: boolean) => {
    setProcessingId(reqId);
    setMessage(null);
    try {
      await resolveLinkRequest(reqId, isApproved);
      setMessage({
        type: 'success',
        text: isApproved ? "Đã CHẤP THUẬN yêu cầu liên kết!" : "Đã TỪ CHỐI yêu cầu liên kết."
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Đã xảy ra lỗi." });
    } finally {
      setProcessingId(null);
    }
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-12 text-center">
        <div className="size-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">
          Không có yêu cầu nào
        </h2>
        <p className="text-stone-500">Mọi thứ đã được xử lý xong!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl text-sm font-medium ${
              message.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200/60 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mt-1">
                <LinkIcon className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                    YÊU CẦU LIÊN KẾT
                  </span>
                  <span className="text-xs text-stone-500 flex items-center gap-1">
                    <Clock className="size-3" />
                    {new Date(req.created_at).toLocaleString("vi-VN")}
                  </span>
                </div>
                <p className="text-stone-800">
                  User ID <span className="font-mono text-xs bg-stone-100 px-1 rounded">{req.requested_by.slice(0,8)}...</span> muốn nhận quyền sở hữu hồ sơ:
                </p>
                <div className="mt-2 font-bold text-lg text-stone-900 flex flex-wrap items-center gap-2">
                  {req.persons?.full_name}
                  {req.persons?.khoas && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md border border-amber-200">
                      {req.persons.khoas.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
              <button
                onClick={() => handleResolve(req.id, false)}
                disabled={processingId === req.id}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
              >
                <XCircle className="size-4" /> Từ chối
              </button>
              <button
                onClick={() => handleResolve(req.id, true)}
                disabled={processingId === req.id}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="size-4" /> Phê duyệt
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
