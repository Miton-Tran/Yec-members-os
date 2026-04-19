"use client";

import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage("Cập nhật mật khẩu thành công! Đang chuyển hướng...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      setError("Đã xảy ra lỗi không xác định.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] select-none selection:bg-amber-200 selection:text-amber-900 relative overflow-hidden">
      {/* Decorative background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#fef3c7,transparent)] pointer-events-none"></div>

      <div className="absolute top-0 inset-x-0 h-screen overflow-hidden pointer-events-none flex justify-center">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-amber-300/20 rounded-full blur-[100px] mix-blend-multiply" />
        <div className="absolute bottom-[0%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-rose-200/20 rounded-full blur-[120px] mix-blend-multiply" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10 w-full">
        <motion.div
          className="max-w-md w-full bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-100/50 to-transparent rounded-bl-[100px] pointer-events-none"></div>

          <div className="text-center mb-8 relative z-10">
            <Link
              href="/"
              className="inline-flex items-center justify-center p-3.5 bg-white rounded-2xl mb-5 shadow-sm ring-1 ring-stone-100 hover:scale-105 hover:shadow-md transition-all duration-300"
            >
              <Shield className="size-8 text-amber-600" />
            </Link>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              Tạo mật khẩu mới
            </h2>
            <p className="mt-3 text-sm text-stone-500 font-medium tracking-wide">
              Mật khẩu mới của bạn phải khác với mật khẩu cũ để đảm bảo an toàn.
            </p>
          </div>

          <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-[13px] font-semibold text-stone-600 mb-1.5 ml-1"
                >
                  Mật khẩu mới
                </label>
                <div className="relative flex items-center group">
                  <KeyRound className="absolute left-3.5 size-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="bg-white/50 text-stone-900 placeholder-stone-400 block w-full rounded-xl border border-stone-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] focus:border-amber-400 focus:ring-amber-400 focus:bg-white pl-11 pr-4 py-3.5 transition-all duration-200 outline-none"
                    placeholder="Nhập mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="block text-[13px] font-semibold text-stone-600 mb-1.5 ml-1"
                >
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative flex items-center group">
                  <KeyRound className="absolute left-3.5 size-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="bg-white/50 text-stone-900 placeholder-stone-400 block w-full rounded-xl border border-stone-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] focus:border-amber-400 focus:ring-amber-400 focus:bg-white pl-11 pr-4 py-3.5 transition-all duration-200 outline-none"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="text-red-700 text-[13px] text-center bg-red-50 p-3 rounded-xl border border-red-100/50 font-medium"
                >
                  {error}
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="text-teal-700 text-[13px] text-center bg-teal-50 p-3 rounded-xl border border-teal-100/50 font-medium"
                >
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 text-[15px] font-bold rounded-xl text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 disabled:opacity-70 disabled:cursor-wait transition-all duration-300 shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:shadow-stone-900/20 hover:-translate-y-0.5"
              >
                {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer className="bg-transparent relative z-10 border-none mt-auto" />
    </div>
  );
}
