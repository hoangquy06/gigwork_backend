## Đánh Giá
- Phù hợp: Dự án chạy NestJS trên Express và đã gắn middleware trực tiếp (JSON, CORS, routes). Helmet là tiêu chuẩn để thêm security headers.
- Lợi ích: Thiết lập `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security` (HSTS), `Content-Security-Policy` (CSP)…

## Ảnh Hưởng Tới Email
- Không chặn gửi email: Helmet chỉ thêm headers vào response HTTP của server. Việc gọi API gửi mail (ví dụ `resend`, `nodemailer`/SMTP) là outbound request từ Node, không bị ảnh hưởng.
- Link xác thực trong email: server trả về 204 hoặc 200; headers bổ sung từ Helmet không cản trở. Nếu có trang HTML hiển thị, CSP có thể cần nới lỏng cho inline CSS/JS (nếu dùng).

## Cấu Hình Đề Xuất
- Base: `helmet()` mặc định cho tất cả routes.
- CORS: giữ nguyên `app.enableCors` và `http.use(cors(...))` — Helmet không thay thế CORS.
- CSP cho Swagger: nới lỏng cho inline script/style ở `/api/docs`:
  - `helmet.contentSecurityPolicy({ useDefaults: true, directives: { "script-src": ["'self'","'unsafe-inline'"], "style-src": ["'self'","'unsafe-inline'" ] } })`
- HSTS (prod, HTTPS): `helmet.hsts({ maxAge: 15552000, includeSubDomains: true, preload: true })` bật theo `NODE_ENV==='production'`.
- Referrer Policy: `helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' })`.
- CORP: nếu trả ảnh/file tĩnh qua API cần cross-origin, dùng `helmet.crossOriginResourcePolicy({ policy: 'cross-origin' })`.

## Triển Khai
1. Cài `helmet`.
2. Trong `src/main.ts`, sau `express.json()` và `cors()`:
   - `const helmet = require('helmet')`
   - `http.use(helmet())`
   - Áp dụng CSP riêng cho `/api/docs` (trước `swaggerUi.setup`).
   - Bật HSTS theo môi trường (prod/HTTPS).
3. Giữ nguyên các router hiện có.

## Kiểm Tra
- Gọi `GET /api/health` hoặc `GET /api/jobs` và kiểm tra headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, (prod) `Strict-Transport-Security`.
- Mở `/api/docs` để chắc Swagger vẫn hiển thị (điều chỉnh CSP nếu cần).
- Thử gửi email xác thực: vẫn gửi bình thường, vì outbound HTTP/SMTP không chịu tác động từ Helmet.

## Ghi Chú
- Dev: không bật HSTS để tránh cảnh báo khi chạy http.
- Nếu thêm các nội dung inline khác ngoài Swagger, cập nhật CSP whitelist tương ứng.
- Không thay đổi workflow auth/verification — chỉ thêm headers bảo mật.