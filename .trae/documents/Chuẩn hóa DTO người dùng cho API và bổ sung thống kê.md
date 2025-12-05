## Mục tiêu
- Chuẩn hóa dữ liệu trả về cho frontend ở `GET /api/users/me` theo checklist thông tin cần thiết.
- Bổ sung thống kê và preview liên quan (ratings, applications, jobs, notifications).
- Đảm bảo không lộ trường nhạy cảm và hiệu năng ổn định.

## Thay đổi API
- Giữ nguyên endpoint: `GET /api/users/me` và `PATCH /api/users/me`.
- Tạo DTO (đối tượng trả về) thống nhất gồm:
  - Nhân dạng: `id`, `email`, `phone`, `createdAt`, `updatedAt`
  - Trạng thái: `isVerified`, `isActive`, `bannedAt`, `lastLoginAt`
  - Vai trò: `isWorker`, `isEmployer`
  - Hồ sơ worker: `{ bio, skills, dob, gender }`
  - Hồ sơ employer: `{ companyName, companyAddress }`
  - Thống kê: `ratingAvg`, `ratingCount`, `applicationCounts`, `jobCounts`, `unreadNotifications`
  - Preview: `recentApplications[]`, `recentJobs[]`, `notificationsPreview[]`

## Triển khai (không phá vỡ contract hiện có)
1. Cập nhật `src/models/Users.js`
   - Thêm hàm `getMeDto(userId)`:
     - Lấy `User` kèm `employee`, `employer` (như hiện tại).
     - Tính `ratingAvg`, `ratingCount` từ bảng `Review` theo `revieweeId`.
     - Tính `applicationCounts` từ bảng `JobApplication` theo `workerId` và nhóm trạng thái.
     - Nếu `isEmployer` có profile, tính `jobCounts`: tổng jobs, jobs đang mở (theo `startDate` hoặc điều kiện open – tạm thời dựa vào thời gian hiện tại).
     - Đếm `unreadNotifications` (nếu có cờ trạng thái chưa đọc; nếu chưa có, trả tổng `notifications` gần đây).
     - Lấy `recentApplications` (5 bản ghi gần nhất) gồm `{ applicationId, jobId, jobTitle, status, appliedAt }`.
     - Lấy `recentJobs` (5 bản ghi gần nhất của employer) gồm `{ jobId, title, location, startDate, workerQuota }`.
     - Lấy `notificationsPreview` (5 bản ghi gần nhất) gồm `{ id, title, type, createdAt }`.
     - Trả đối tượng DTO đã chuẩn hóa, tránh trả `passwordHash`.
2. Cập nhật `src/controllers/userController.js`
   - Sử dụng `Users.getMeDto(req.user.id)` cho `GET /api/users/me`.
   - Giữ `PATCH /api/users/me` như hiện tại, nhưng chỉ cho phép cập nhật các trường an toàn (`phone`).

## Bảo mật & Hiệu năng
- Không trả `passwordHash`, token, hoặc PII không cần thiết.
- Dùng Prisma `count` và `findMany` có `select`/`include` tối ưu.
- Nếu cần, thêm index cho cột lọc thường dùng (ví dụ `revieweeId`, `workerId`, `createdAt`).

## Tùy chọn nâng cao (để sau)
- Thêm endpoint public `GET /api/users/:id` trả profile tối giản (ẩn dữ liệu nhạy cảm).
- Cho phép truyền query `previewLimit` để thay đổi số lượng preview.
- Thêm cache nhẹ (in-memory) cho thống kê không đổi nhanh.

## Định dạng phản hồi
- Theo README: `{ statusCode: 200, message: "Operation successful", data: <DTO> }`.

## Kiểm thử
- Tạo user worker và employer, thêm hồ sơ, tạo job, ứng tuyển và review → gọi `GET /api/users/me` để xác nhận đủ trường.
- Xác minh không có trường nhạy cảm trong response.

Xác nhận kế hoạch để mình tiến hành cập nhật model và controller, rồi chạy kiểm thử thực tế.