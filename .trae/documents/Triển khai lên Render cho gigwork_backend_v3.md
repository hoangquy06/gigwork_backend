## Tổng Quan
- Ứng dụng Node/NestJS dùng Express, lắng nghe `process.env.PORT` (`src/main.ts:46-47`).
- Có scripts `build` và `start` (`package.json:6-8`), dùng Prisma/Postgres (`prisma/schema.prisma:5-8`) với migrations sẵn.
- Swagger UI tại `/api/docs`, phục vụ `openapi.json` từ `src/dist/docs` hoặc `docs` (`src/main.ts:31-45`).
- Email verification hỗ trợ chế độ dev/smtp (`src/models/Verification.js:13-39`).

## Tính Khả Thi
- Render web service tương thích: app sử dụng `PORT`, không dùng WebSocket đặc thù, không lưu trữ local.
- Cần chạy Prisma `generate` và `migrate deploy` trong quá trình build/deploy.
- Nên bind `0.0.0.0` khi `listen` để Render có thể expose port.

## Các Thay Đổi Đề Xuất
1. Cập nhật scripts trong `package.json`:
   - Thêm `postinstall`: `prisma generate`.
   - Thêm `migrate:deploy`: `prisma migrate deploy`.
   - Xác nhận `build`: `tsc -p tsconfig.json`, `start`: `node dist/main.js` (`package.json:6-8`).
2. Sửa `listen` bind host:
   - Đổi thành `await app.listen(port, '0.0.0.0')` (`src/main.ts:46-47`).
3. (Tuỳ chọn) Thêm `render.yaml` để deploy theo blueprint:
   - `type: web`, `env: node`.
   - `buildCommand`: `npm install && npm run build`.
   - `startCommand`: `npm run start`.
   - `postDeployCommand`: `npx prisma migrate deploy`.
   - Khai báo biến môi trường và tham chiếu database.
4. Đảm bảo `openapi.json` tồn tại ở một trong các đường dẫn đã kiểm tra (`src/docs/openapi.json`).

## Cấu Hình Render
- Tạo `Web Service` trỏ tới repo này.
- Thiết lập:
  - `Build Command`: `npm install && npm run build`.
  - `Start Command`: `npm run start`.
  - `Post-Deploy Command`: `npx prisma migrate deploy`.
- Tạo `PostgreSQL` trên Render và đặt `DATABASE_URL` vào env của service.
- Biến môi trường cần thiết:
  - `DATABASE_URL` (bắt buộc).
  - `JWT_SECRET`.
  - `APP_URL` (ví dụ: URL của frontend hoặc của service nếu dùng xác minh qua API).
  - `SMTP_MODE` (`dev` hoặc `smtp`), `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` nếu gửi mail thật (`src/models/Verification.js:15-24`).

## Kiểm Thử Sau Deploy
- Kiểm tra health bằng `GET /api/docs` (Swagger) và `GET /api/jobs` (`src/routes/jobsRoutes.js:9`).
- Xác nhận migrations đã áp dụng: dữ liệu bảng hiện diện.
- Nếu `SMTP_MODE=dev`, gọi gửi email xác minh để nhận `link` trong response (`src/models/Verification.js:31-39`).

## Rủi Ro/Chú Ý
- Không lưu trữ file local; phù hợp với Render ephemeral disk.
- `openapi.json` phải có sẵn trong repo; nếu thiếu, Swagger endpoint trả 404 (`src/main.ts:44`).
- Có thể bổ sung `engines.node` trong `package.json` hoặc cấu hình Node version trên Render nếu cần.

## Kế Hoạch Thực Hiện
1. Cập nhật `package.json` để thêm `postinstall` và `migrate:deploy`.
2. Sửa `src/main.ts` để bind `0.0.0.0` khi `listen`.
3. Thêm `render.yaml` (tuỳ chọn) với service và database.
4. Tạo dịch vụ Web và Postgres trên Render; cấu hình env.
5. Deploy, chạy migrations, kiểm thử Swagger và các endpoint chính.

Bạn xác nhận để mình tiến hành các cập nhật và thiết lập nêu trên?