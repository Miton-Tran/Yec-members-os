<p align="center">
  <img src="https://raw.githubusercontent.com/homielab/giapha-os/main/public/icon.png" alt="Members OS Icon" width="100" height="100" style="border-radius: 22%; border: 0.5px solid rgba(0,0,0,0.1);" />
</p>

# YEC Members OS

Đây là mã nguồn mở cho ứng dụng quản lý thành viên câu lạc bộ, cung cấp giao diện trực quan để xem sơ đồ bộ máy, quản lý thành viên và tìm kiếm các liên kết thế hệ.

Dự án ra đời từ nhu cầu thực tế: cần một hệ thống Cloud để các thành viên ở nhiều nơi có thể cùng cập nhật thông tin qua các thời kỳ. Việc tự triển khai mã nguồn mở giúp câu lạc bộ bạn nắm trọn quyền kiểm soát dữ liệu nhạy cảm.


## Mục lục

- [Các tính năng chính](#các-tính-năng-chính)
- [Cài đặt và Chạy dự án trên máy cá nhân](#cài-đặt-và-chạy-dự-án-trên-máy-cá-nhân)
- [Tài khoản đầu tiên](#tài-khoản-đầu-tiên)
- [Xử lý lỗi khi đăng ký](#xử-lý-lỗi-khi-đăng-ký)
- [Phân quyền người dùng (User Roles)](#phân-quyền-người-dùng-user-roles)
- [Đóng góp (Contributing)](#đóng-góp-contributing)
- [Tuyên bố từ chối trách nhiệm & Quyền riêng tư](#tuyên-bố-từ-chối-trách-nhiệm--quyền-riêng-tư)
- [Giấy phép (License)](#giấy-phép-license)

## Các tính năng chính

- **Sơ đồ trực quan**: Xem mạng lưới thành viên dạng Cây (Tree) và Sơ đồ tư duy (Mindmap).
- **Quản lý thành viên**: Lưu trữ mini-CV, avatar và sắp xếp thứ tự các ban bộ.
- **Quản lý quan hệ**: Nhận diện tiền bối/hậu bối, người hướng dẫn và các cấp quản lý.
- **Thống kê**: Theo dõi dữ liệu nhân sự của từng thế hệ và ban bộ.
- **Sao lưu dữ liệu**: Xuất/nhập file JSON, CSV, GEDCOM để lưu trữ hoặc di chuyển dễ dàng.
- **Bảo mật**: Phân quyền (Admin, Editor, Member) và bảo vệ dữ liệu bằng Supabase.
- **Đa thiết bị**: Giao diện hiện đại, tối ưu cho cả máy tính và điện thoại.



---

## 1. Tạo Database (Miễn phí với Supabase)

1. Tạo tài khoản miễn phí tại https://github.com nếu chưa có.
2. Tạo tài khoản miễn phí tại https://supabase.com nếu chưa có (khuyên dùng đăng ký bằng tài khoản GitHub cho nhanh).
3. Tạo **New Project**. Đợi khoảng 1 -> 2 phút để hệ thống khởi tạo xong.
4. Vào **Project Settings → API**, giữ lại 2 giá trị này để dùng ở bước tiếp theo:
   - `Project URL`
   - `Project API Keys`

---

## Cài đặt và Chạy dự án trên máy cá nhân

Yêu cầu: máy đã cài [Node.js](https://nodejs.org/en) và [Bun](https://bun.sh/)

1. Clone hoặc tải project về máy.
2. Đổi tên file `.env.example` thành `.env.local`.
3. Mở file `.env.local` và điền các giá trị đã lưu ở **bước 1**.

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-anon-key"
```

4. Cài thư viện

```bash
bun install
```

5. Chạy dự án

```bash
bun run dev
```

Mở trình duyệt và truy cập: `http://localhost:3000`



## Tài khoản đầu tiên

- Đăng ký tài khoản mới khi vào web lần đầu.
- Người đăng ký đầu tiên sẽ tự động có quyền **admin**.
- Các tài khoản đăng ký sau sẽ mặc định là **member**.

## Xử lý lỗi khi đăng ký

Sau khi cài đặt xong, nếu bạn gặp lỗi `Failed to fetch` khi đăng ký:

**Nguyên nhân:** Supabase chặn các request từ domain chưa được thêm vào danh sách cho phép.

**Cách khắc phục:**

1. Vào [Supabase Dashboard](https://supabase.com/dashboard) → chọn Project của bạn.
2. Vào **Authentication → URL Configuration**.
3. Ở mục **Site URL**, điền URL chính của ứng dụng, ví dụ:
   - Máy cá nhân: `http://localhost:3000`
4. Ở mục **Redirect URLs**, nhấn **Add URL** và thêm:
   - `http://localhost:3000/**` (nếu chạy local)
5. Nhấn **Save** và thử lại.

> **Lưu ý:** Nếu dùng domain tùy chỉnh, hãy thêm cả domain đó vào danh sách.

---

## Phân quyền người dùng (User Roles)

Hệ thống có 3 cấp độ phân quyền để dễ dàng quản lý ai được phép cập nhật thông tin:

1. **Admin (Quản trị viên):** Có toàn quyền đối với hệ thống.
2. **Editor (Biên soạn):** Cho phép thêm, sửa, xóa thông tin hồ sơ và các mối quan hệ.
3. **Member (Thành viên):** Chỉ có thể xem sơ đồ hệ thống và các thống kê trực quan.

## Đóng góp (Contributing)

Dự án này là mã nguồn mở, hoan nghênh mọi đóng góp, báo cáo lỗi (issues) và yêu cầu sửa đổi (pull requests) để phát triển ứng dụng ngày càng tốt hơn.

## Tuyên bố từ chối trách nhiệm & Quyền riêng tư

> **Dự án này chỉ cung cấp mã nguồn (source code). Không có bất kỳ dữ liệu cá nhân nào được thu thập hay lưu trữ bởi tác giả.**

- **Tự lưu trữ hoàn toàn (Self-hosted):** Khi bạn triển khai ứng dụng, toàn bộ dữ liệu (tên, ngày sinh, chức vụ, thông tin liên hệ...) được lưu trữ **trong tài khoản Supabase của chính bạn**.

- **Không thu thập dữ liệu:** Không có analytics, không có tracking, không có telemetry, không có bất kỳ hình thức thu thập thông tin người dùng nào được tích hợp trong mã nguồn.

- **Bạn kiểm soát dữ liệu của bạn:** Mọi dữ liệu thành viên đều nằm hoàn toàn trong cơ sở dữ liệu Supabase mà bạn tạo và quản lý. Bạn có thể xóa, xuất hoặc di chuyển dữ liệu bất cứ lúc nào.

## Giấy phép (License)

Dự án được phân phối dưới giấy phép MIT.
Bản quyền dự án thuộc về miton.tran.95@gmail.com