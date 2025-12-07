## Nguyên Tắc
- Không thay đổi bất kỳ schema DB hay chạy migration.
- Tuân thủ REST cơ bản: dùng HTTP status thay vì `statusCode` trong body, trả về resource trực tiếp.
- Sử dụng mã trạng thái chuẩn: 200 (OK), 201 (Created), 202 (Accepted cho tác vụ async), 204 (No Content cho delete), 4xx/5xx cho lỗi.

## Thay Đổi Ở Controllers (chỉ code ứng dụng, không động tới DB)
- Loại bỏ envelope `{ statusCode, message }` và trả về resource trực tiếp.
- Chuẩn hóa từng endpoint:
  - Auth:
    - `POST /api/auth/register` → 201 Created; body `{ token, user }`; header `Location: /api/users/me`.
    - `POST /api/auth/login` → 200 OK; body `{ token, user }`.
    - `POST /api/auth/send-verification` → 202 Accepted; body `{ success: true }`.
    - `GET /api/auth/verify-email?token=...` → 204 No Content (email verified xong không cần body).
  - Users:
    - `GET /api/users/me` → 200 OK; body là User DTO hiện tại.
  - Jobs:
    - `GET /api/jobs` → 200 OK; body `{ items: Job[], meta: { count, filters } }`.
    - `GET /api/jobs/{id}` → 200 OK; body Job.
    - `POST /api/jobs` → 201 Created; body Job; header `Location: /api/jobs/{id}`.
    - `PATCH /api/jobs/{id}` → 200 OK; body Job.
    - `DELETE /api/jobs/{id}` → 204 No Content.
    - `POST /api/jobs/{id}/sessions` → 201 Created; body Session; `Location` header.
    - `GET /api/jobs/{id}/sessions` → 200 OK; body `Session[]`.
    - `POST /api/jobs/{id}/skills` → 201 Created; body `{ created: number, skills: string[] }`.
  - Applications (giữ route hiện có, chuẩn REST ở phản hồi):
    - `POST /api/applications` → 201 Created; body Application.
    - `POST /api/applications/{id}/accept|confirm|complete|cancel` → 200 OK; body Application cập nhật.
  - Reviews:
    - `POST /api/reviews` → 201 Created; body Review.
    - `GET /api/reviews/{userId}` → 200 OK; body `Review[]`.
  - Notifications:
    - `GET /api/notifications` → 200 OK; body `Notification[]`.

## Lỗi & Bảo Mật
- Chuẩn hóa lỗi theo RFC 7807 (Problem Details) ở body `application/problem+json`:
  - `{ type, title, status, detail, instance }`.
- `401` cho thiếu/invalid JWT; `403` cho chưa verified hoặc không đủ quyền; `404` khi resource không tồn tại; `409` cho xung đột; `422` cho validation.
- Không thay đổi tầng Prisma/models; chỉ thay đổi cách controllers/middleware trả về.

## Cập Nhật Swagger (openapi.json)
- Sửa tất cả responses thành REST style phía trên; bỏ `statusCode/message` khỏi schema thành công.
- Giữ tags/operationId; thêm ví dụ chuẩn từng API.
- Khai báo lỗi dùng `application/problem+json` với schema Problem Details.

## Tương Thích Ngược (nếu cần)
- Có thể giữ tạm một flag để vẫn trả envelope cũ trong một số endpoint nếu frontend chưa kịp cập nhật; mặc định chuyển sang REST.

## Kiểm Tra
- Chạy `npm run start:dev` và kiểm tra `http://localhost:<PORT>/api/docs`.
- Thực thi nhanh: register → send-verification → verify-email → tạo job → list → delete để xác nhận status codes và body đúng REST.

Nếu đồng ý, tôi sẽ cập nhật các controllers và openapi.json theo kế hoạch, đảm bảo không động tới schema DB.