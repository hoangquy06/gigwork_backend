## Mục tiêu
- Việt hóa toàn bộ nội dung mô tả trong tài liệu API để người dùng đọc hiểu nhanh, rõ ràng.
- Giữ nguyên cấu trúc và các khóa kỹ thuật (tên path, schema, field) bằng tiếng Anh để tránh phá vỡ client.

## Phạm vi Việt hóa
1. Thông tin tổng quan (`info`)
- `title`, `description`, `termsOfService`, `contact`, `license` → dịch sang tiếng Việt.

2. Mô tả thao tác (`paths`)
- `summary`, `description` của mỗi endpoint.
- Mô tả `parameters` (tên, ý nghĩa, ví dụ).
- Mô tả `requestBody` (yêu cầu, kiểu, ràng buộc).
- `responses` (diễn giải mã 2xx/4xx/5xx, nội dung trả về).
- `tags` mô tả phạm vi business: Auth, Người dùng, Hồ sơ, Công việc, Ứng tuyển, Đánh giá, Thông báo.

3. Thành phần dùng chung (`components`)
- `securitySchemes` mô tả Bearer JWT.
- `schemas` mô tả các DTO: UserMe, Job, JobSession, JobRequiredSkill, JobApplication (enum trạng thái), Review, Notification.
- Mô tả `ErrorResponse` (ý nghĩa `error`, `code`, `details`, `traceId`, `timestamp`, `path`).
- Mô tả `Envelope` chuẩn: `{ statusCode, message, data, meta }`.

4. Ví dụ (`examples`, `x-codeSamples`)
- Thêm ví dụ tiếng Việt cho request/response: register/login, users/me, jobs list, tạo job, ứng tuyển (apply/accept/confirm/complete), tạo review.
- Thêm đoạn lệnh mẫu (curl/JS/TS) có chú thích tiếng Việt.

## Quy tắc dịch
- Giữ thuật ngữ kỹ thuật phổ biến: JWT, Bearer token, ISO 8601, pagination.
- Dịch câu ngắn, rõ, dùng giọng trung lập, nhất quán.
- Không dịch tên trường JSON, tên path, tên enum.
- Ví dụ:
  - "Operation successful" → "Thao tác thành công".
  - "Unauthorized" → "Chưa xác thực".
  - "Forbidden" → "Không đủ quyền".
  - "Bad Request" → "Yêu cầu không hợp lệ".

## Ví dụ Việt hóa (mẫu)
- `summary`/`description` cho `POST /api/auth/register`:
  - Tóm tắt: "Đăng ký tài khoản và nhận token JWT".
  - Mô tả: "Yêu cầu email, mật khẩu, và vai trò (isWorker/isEmployer). Ít nhất một vai trò phải là true. Trả về token và thông tin người dùng".
- `ErrorResponse`:
  - "Mô tả: Cấu trúc lỗi chuẩn. Trả về thông điệp lỗi, mã trạng thái HTTP, và (tùy chọn) chi tiết lỗi, mã truy vết, thời gian, đường dẫn API".

## Quy trình thực hiện
1. Việt hóa `info` và mô tả `tags`.
2. Thêm/việt hóa `summary`/`description` cho tất cả endpoints.
3. Việt hóa `components.schemas` description; bổ sung ví dụ.
4. Thêm `x-codeSamples` minh họa tiếng Việt.
5. Rà soát trên `/api/docs` (Swagger UI) để đảm bảo hiển thị đẹp.

## Bảo toàn tương thích
- Không đổi tên path, field, schema.
- Chỉ thay đổi chuỗi mô tả, ví dụ và metadata.

Xác nhận để mình bắt đầu cập nhật `src/docs/openapi.json` theo các mục trên và xuất bản tại `/api/docs`. 