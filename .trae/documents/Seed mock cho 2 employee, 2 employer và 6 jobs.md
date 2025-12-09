## Mục Tiêu
Tạo mock data gồm 2 employer và 2 employee, mỗi employer có 3 jobs đầy đủ trường (bao gồm salary), kèm đầy đủ workflow ứng tuyển: pending → accepted → completed (và isComplete/isPaid), cộng thêm reviews và notifications để FE test end-to-end.

## Tổng Quan Dữ Liệu
- Accounts:
  - Employer: `employer1@gigwork.local`, `employer2@gigwork.local`
  - Employee: `employee1@gigwork.local`, `employee2@gigwork.local`
  - Password chung: `Password123!` (đã hash bằng bcrypt khi lưu)
- Profiles:
  - EmployerProfile cho mỗi employer (companyName, companyAddress)
  - EmployeeProfile cho mỗi employee (bio, skills JSON, gender, dob optional)
- Jobs (3/job mỗi employer):
  - Trường bắt buộc: `title`, `description`, `location`, `startDate`, `durationDays`, `workerQuota`, `salary`, `type`, `status`
  - Sessions: 2 phiên/ngày liên tiếp (9:00–17:00), dùng `JobSession`
  - Skills: 2–3 kỹ năng mỗi job, dùng `JobRequiredSkill`
  - employerId tham chiếu `User.id` (đã chỉnh schema trước đó)

## Workflow Ứng Tuyển
- Mỗi employer:
  - Job A: employee1 apply → `status=pending`
  - Job B: employee1 apply → employer accept → `status=accepted`
  - Job C: employee2 apply → employer accept → sau ngày kết thúc, set `status=completed`, `isComplete=true`, `isPaid=true`
- Reviews:
  - Employer đánh giá employee đã completed: `rating=5`, `comment`
- Notifications:
  - Gửi notification cho worker khi accepted/completed; cho employer khi có pending

## Endpoint Dev
- Cập nhật `POST /api/dev/seed-mock` để sinh bộ dữ liệu lớn (idempotent, dùng upsert theo email), trả về:
  - `employers`: mảng thông tin cơ bản + credentials
  - `employees`: mảng thông tin cơ bản + credentials
  - `jobs`: mảng jobs theo employer, gồm sessions, skills, salary
  - `applications`: mảng các application với trạng thái
- `GET /api/dev/mocks`: trả snapshot đầy đủ như trên để FE tiêu thụ trực tiếp

## Triển Khai Kỹ Thuật
- File: `src/controllers/devController.js`
  - Tạo/Upsert 2 users employer, 2 users employee
  - Upsert EmployerProfile/EmployeeProfile tương ứng
  - Tạo 3 Job cho mỗi employer với đủ trường; thêm sessions & skills bằng nested create
  - Tạo applications theo workflow; cập nhật `status` và set `isComplete`, `isPaid` cho job completed
  - Upsert review và tạo notifications phù hợp
  - Trả response có cấu trúc dễ dùng cho FE
- Không thay đổi schema ngoài scope hiện có (salary đã có)

## Xác Minh
- `POST /api/dev/seed-mock` → nhận JSON gồm users, jobs, applications
- Đăng nhập employer và gọi `GET /api/jobs` → thấy 3 jobs với `salary` và sessions/skills
- Đăng nhập employee và gọi `GET /api/users/me` → kiểm tra `applicationCounts` và `recentApplications`
- `GET /api/dev/mocks` → đối chiếu toàn bộ dataset

## Ghi Chú
- Luồng không dùng `confirmed`; chỉ `pending`, `accepted`, `completed` với cờ `isComplete/isPaid`
- Idempotent: nếu dữ liệu tồn tại (email cố định), chỉ update/tạo phần còn thiếu
- Có thể mở rộng thêm avatar/company_logo sau nếu cần