# Hồ sơ Đấu thầu — bản độc lập (Vite + React + Supabase)

Đây là bản đóng gói lại ứng dụng để chạy như một trang web độc lập, ngoài Claude.ai.
Vì `window.storage` (nơi ứng dụng lưu dữ liệu khi chạy trong Claude Artifact) không tồn
tại bên ngoài Claude.ai, dự án này thay nó bằng **Supabase** (dữ liệu dùng chung) và
**localStorage của trình duyệt** (chỉ cho tên hiển thị cá nhân) — xem `src/storage-shim.js`.
Toàn bộ phần còn lại của ứng dụng (`src/App.jsx`) giữ nguyên logic như bản Artifact.

## 1. Cài Node.js

Cần Node.js 18 trở lên. Kiểm tra: `node -v`. Nếu chưa có, tải tại https://nodejs.org.

## 2. Tạo project Supabase (miễn phí)

1. Vào https://supabase.com → **Start your project** → đăng nhập (Google/GitHub) → **New project**.
2. Đặt tên project, chọn mật khẩu database (không cần nhớ nếu chỉ dùng bảng đơn giản này), chọn khu vực gần bạn (ví dụ Singapore).
3. Chờ khoảng 1–2 phút để project khởi tạo xong.
4. Vào **SQL Editor** (menu bên trái) → **New query** → dán toàn bộ nội dung file
   `supabase/schema.sql` trong thư mục này → bấm **Run**. Bước này tạo bảng `kv_store`
   và mở quyền đọc/ghi công khai (giống đúng mô hình "ai có link đều dùng chung" như
   bản trước).
5. Vào **Project Settings → API**. Lấy 2 giá trị:
   - **Project URL** (dạng `https://xxxxx.supabase.co`)
   - **anon public key** (chuỗi dài bắt đầu bằng `eyJ...`)

## 3. Cấu hình project

Trong thư mục này:

```bash
cp .env.example .env
```

Mở file `.env` vừa tạo, dán 2 giá trị lấy được ở bước trên vào:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 4. Cài đặt và chạy thử ở máy local

```bash
npm install
npm run dev
```

Mở trình duyệt tại địa chỉ hiện ra (thường là `http://localhost:5173`). Thử tạo người
dùng đầu tiên, tạo dự án, tạo một hồ sơ — nếu lưu/tải lại trang mà dữ liệu vẫn còn,
nghĩa là kết nối Supabase đã đúng.

## 5. Đưa lên internet (deploy)

Cách nhanh nhất là dùng **Vercel** (miễn phí cho quy mô nhỏ):

1. Đưa thư mục này lên một repository GitHub (tạo repo mới, `git init`, `git add .`,
   `git commit -m "init"`, `git push`).
2. Vào https://vercel.com → đăng nhập bằng GitHub → **Add New → Project** → chọn repo vừa tạo.
3. Ở bước cấu hình, thêm **Environment Variables**:
   - `VITE_SUPABASE_URL` = giá trị Project URL
   - `VITE_SUPABASE_ANON_KEY` = giá trị anon public key
4. Bấm **Deploy**. Sau khi xong, Vercel cấp cho bạn một địa chỉ dạng
   `https://ten-du-an.vercel.app` — đây là link cố định để cả nhóm truy cập.

(Netlify hoạt động tương tự: kéo thả thư mục sau khi chạy `npm run build`, hoặc kết nối
GitHub, và cũng cần khai báo 2 biến môi trường ở trên trong phần Site settings →
Environment variables.)

## Những điều cần biết

- **Không có mật khẩu thật.** Giống bản Artifact, ai có link đều tạo được "tên hiển thị"
  và thao tác theo đúng phân quyền được gán trong ứng dụng — đây là giới hạn đã trao đổi
  từ trước, không phải lỗi phát sinh khi tách ra bản độc lập.
- **Khóa `anon public key` sẽ lộ trong mã nguồn frontend** (đây là điều bình thường với
  Supabase — khóa này vốn được thiết kế để dùng ở phía trình duyệt), an toàn của dữ liệu
  hiện dựa vào chính sách (policy) trong `schema.sql`, đang mở công khai đọc/ghi. Nếu sau
  này cần giới hạn chặt hơn (ví dụ bắt đăng nhập email/mật khẩu thật trước khi ghi dữ
  liệu), cần bổ sung Supabase Auth và viết lại policy — có thể làm ở bước sau.
- **Tên hiển thị của bạn lưu trong `localStorage` của từng trình duyệt/máy.** Nếu đổi
  trình duyệt hoặc xóa dữ liệu duyệt web, bạn sẽ được hỏi chọn lại tên từ danh sách người
  dùng (dữ liệu người dùng/dự án/hồ sơ vẫn còn nguyên trên Supabase).
