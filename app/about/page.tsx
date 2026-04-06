"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Info, Mail, ShieldAlert, Users, Network, UserCircle, Star } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 selection:bg-amber-200 selection:text-amber-900 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>

      <Link href="/dashboard" className="btn absolute top-6 left-6 z-20 group bg-white/80 backdrop-blur border border-stone-200 shadow-sm hover:border-amber-400 text-[15px] font-semibold px-4 py-2.5 rounded-xl text-stone-700 flex items-center gap-2 transition-all">
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
        Quay lại
      </Link>

      <div className="flex-1 flex flex-col justify-center items-center px-5 py-24 sm:py-32 relative z-10 w-full mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-5xl w-full"
        >
          {/* Hero */}
          <div className="bg-stone-900 rounded-[2.5rem] p-10 sm:p-16 shadow-2xl border border-stone-800 mb-8 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-10 sm:gap-14">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
            
            <div className="size-28 sm:size-36 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shrink-0 mt-2 sm:mt-0 rotate-3 hover:rotate-6 transition-transform duration-300 relative z-10">
               <Star className="size-14 sm:size-16 text-white fill-white/20" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
                <Info className="size-4 text-amber-400" />
                <span className="text-[13px] font-black text-amber-300 uppercase tracking-[0.2em]">Dự án Nền tảng</span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-sm">
                YEC Members
              </h1>
              <p className="text-stone-300 leading-relaxed text-base sm:text-[17px] max-w-2xl font-medium">
                Nền tảng quản lý thành viên câu lạc bộ chuyên nghiệp, được xây dựng để xóa nhòa khoảng cách giữa các thế hệ. Trang bị hồ sơ cá nhân hiện đại chuẩn CV, phân quyền thông minh và xây dựng dòng thời gian lịch sử trực quan.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 flex flex-col items-center sm:items-start text-center sm:text-left gap-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="p-3.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-2xl w-fit">
                <Users className="size-7" />
              </div>
              <div>
                <h3 className="text-[19px] font-bold text-stone-900 mb-2">Quản lý thế hệ</h3>
                <p className="text-stone-500 text-[15px] leading-relaxed">Phân loại thành viên theo Khóa bài bản, cập nhật sát sao và xây dựng những trang nhật ký nhiệm kỳ ấn tượng.</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 flex flex-col items-center sm:items-start text-center sm:text-left gap-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="p-3.5 bg-sky-50 border border-sky-100 text-sky-600 rounded-2xl w-fit">
                <UserCircle className="size-7" />
              </div>
              <div>
                <h3 className="text-[19px] font-bold text-stone-900 mb-2">Hồ sơ cá nhân</h3>
                <p className="text-stone-500 text-[15px] leading-relaxed">Không gian tự do để tạo dựng dấu ấn cá nhân: trưng bày chuyên môn, điểm lại thành tựu và khát vọng.</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 flex flex-col items-center sm:items-start text-center sm:text-left gap-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl w-fit">
                <Network className="size-7" />
              </div>
              <div>
                <h3 className="text-[19px] font-bold text-stone-900 mb-2">Mạng lưới kết nối</h3>
                <p className="text-stone-500 text-[15px] leading-relaxed">Thông tin liên lạc và kinh nghiệm được chia sẻ cởi mở nhằm thúc đẩy tìm kiếm đối tác và hợp tác liên thế hệ.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16 shadow-sm border border-stone-200 mb-6">
            <div className="max-w-4xl mx-auto">

              {/* Privacy */}
              <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl mb-5">
                  <ShieldAlert className="size-7" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-3 tracking-tight">
                  Cam kết bảo mật
                </h2>
                <p className="text-stone-500 font-semibold text-[17px]">Tổ chức trực tiếp làm chủ kho lưu trữ dữ liệu</p>
              </div>

              <div className="bg-stone-50 border border-stone-200/60 rounded-[2rem] p-8 sm:p-12 mb-16">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-10 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm">
                   <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl text-stone-600 shrink-0"><Info className="size-6" /></div>
                   <p className="font-bold text-stone-800 text-[16px] leading-relaxed text-center sm:text-left">
                     Nền tảng giao quyền sở hữu triệt để (Self-hosted). Tác giả mã nguồn tuyệt đối không có khả năng truy cập, thu thập hay sao lưu bất kỳ mẩu dữ liệu cá nhân nào xuất phát từ tổ chức của bạn.
                   </p>
                </div>

                <div className="space-y-8">
                   <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
                      <div className="w-2 h-10 bg-amber-400 rounded-full shrink-0 hidden sm:block" />
                      <div>
                         <h4 className="font-bold text-stone-900 text-lg mb-1.5">Lưu trữ biệt lập</h4>
                         <p className="text-stone-600 text-[15px] sm:text-base leading-relaxed">Toàn bộ dữ liệu thành viên, thông tin liên hệ ngoại vi được cô lập và lưu trữ trực tiếp <strong className="text-stone-800">trong tài khoản đám mây (Database) tự cấp</strong> của riêng câu lạc bộ.</p>
                      </div>
                   </div>
                   <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
                      <div className="w-2 h-10 bg-sky-400 rounded-full shrink-0 hidden sm:block" />
                      <div>
                         <h4 className="font-bold text-stone-900 text-lg mb-1.5">Không theo dõi (0% Tracking)</h4>
                         <p className="text-stone-600 text-[15px] sm:text-base leading-relaxed">Chúng tôi cam đoan không bao giờ nhúng bất kì mã theo dõi dấu chân (Cookies trackers), hành vi hệ thống hay dịch vụ thu thập liệu phân tích bên thứ ba nào vào mã nguồn.</p>
                      </div>
                   </div>
                   <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
                      <div className="w-2 h-10 bg-emerald-400 rounded-full shrink-0 hidden sm:block" />
                      <div>
                         <h4 className="font-bold text-stone-900 text-lg mb-1.5">Toàn quyền tự quyết</h4>
                         <p className="text-stone-600 text-[15px] sm:text-base leading-relaxed">Dữ liệu được làm ra bởi bạn và vĩnh viễn thuộc về bạn. Bạn được cấp phép kiểm soát, sao chép, trích xuất dữ liệu thô mọi lúc mọi nơi mà không bị khóa hệ sinh thái.</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Contact CTA */}
              <div className="text-center bg-stone-900 rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-xl max-w-3xl mx-auto">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px]" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[50px]" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="p-3 bg-white/10 border border-white/20 text-white rounded-2xl mb-5 backdrop-blur-md shadow-lg">
                    <Mail className="size-8" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
                    Hỗ trợ & Đóng góp
                  </h2>
                  <p className="text-stone-300 font-medium leading-relaxed text-[15px] mb-8 max-w-xl mx-auto">
                    Mọi ý tưởng đóng góp về trải nghiệm, phác thảo tính năng mới, hay báo cáo bất thường về tốc độ, đừng ngần ngại gửi tin về cổng liên lạc.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <a
                      href="mailto:Miton.tran.95@gmail.com"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-900 text-[15px] font-black tracking-wide rounded-xl transition-all shadow-md transform hover:-translate-y-0.5"
                    >
                      <Mail className="size-4" />
                      Miton.tran.95@gmail.com
                    </a>
                    
                    <a
                      href="https://zalo.me/0886688443"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[15px] font-bold tracking-wide rounded-xl transition-all shadow-md backdrop-blur-md transform hover:-translate-y-0.5"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                        <path d="M21.384 10.32c-.092-2.184-1.21-4.225-3.08-5.632C16.435 3.282 14.168 2.5 11.5 2.5s-4.936.782-6.804 2.188c-1.87 1.407-2.988 3.448-3.08 5.632-.016.376.046.75.18 1.106.136.355.352.67.63.923l.142.12c1.042.872 2.376 1.408 3.844 1.545l-1.077 3.32a.5.5 0 00.672.632l3.77-1.785c.575.05 1.162.077 1.76.077 2.668 0 4.936-.782 6.804-2.188 1.87-1.407 2.988-3.448 3.08-5.632.016-.376-.046-.75-.18-1.106a2.63 2.63 0 00-.63-.923l-.142-.12zm-3.834 2.51H10.15c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h5.4c.642 0 1.25-.255 1.704-.71.455-.454.71-1.062.71-1.704s-.255-1.25-.71-1.704c-.454-.455-1.062-.71-1.704-.71h-.3c-.276 0-.5.224-.5.5s.224.5.5.5h.3c.376 0 .736.15 1.002.415.265.266.414.626.414 1.002s-.15.736-.414 1.002c-.266.265-.626.414-1.002.414h-5.4c-.276 0-.5.224-.5.5s.224.5.5.5h7.4c.276 0 .5.224.5.5s-.224.5-.5.5z"/>
                      </svg>
                      Zalo: 0886.688.443
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
