## Mục tiêu cập nhật
- Xóa toàn bộ dữ liệu hiện có trong DB theo yêu cầu.
- Tạo bảng `job_location` với: `job_id` (FK→`Job.id`), `province`, `city`, `ward`, `address`.
- Thêm `jobs.location_id` (FK→`job_location.job_id`).
- Loại bỏ hoàn toàn cột `location` khỏi bảng `jobs` và khỏi API.

## Thay đổi CSDL (Prisma)
- Sửa `prisma/schema.prisma`:
  - Xóa trường `location` trong `model Job` (hiện ở prisma/schema.prisma:57).
  - Thêm model:
    ```prisma
    model JobLocation {
      jobId   Int   @id
      province String
      city     String
      ward     String?
      address  String
      job      Job   @relation(fields: [jobId], references: [id], onDelete: Cascade)
      @@index([province, city, ward])
    }
    ```
  - Thêm vào `Job`:
    ```prisma
    model Job {
      // ...
      locationId  Int?
      locationRef JobLocation? @relation(fields: [locationId], references: [jobId], onDelete: SetNull)
    }
    ```

## Xóa dữ liệu hiện có
- Dev/test: dùng Prisma reset để xóa mọi dữ liệu và áp dụng lại migrations:
  - Chạy `npx prisma migrate reset --force` (sẽ drop schema, chạy lại tất cả migrations, không giữ dữ liệu).
- Nếu muốn truncate thay vì reset toàn bộ:
  - Thực thi SQL `TRUNCATE` theo thứ tự quan hệ hoặc dùng `TRUNCATE ... CASCADE` cho các bảng: `JobApplication`, `JobRequiredSkill`, `JobSession`, `Review`, `Notification`, `EmailVerification`, `ProfileImage`, `EmployerProfile`, `EmployeeProfile`, `Job`, `User`.
- Vì dữ liệu bị xóa, không cần backfill từ `Job.location`.

## Cập nhật Model/Service
- Sửa `src/models/Jobs.js`:
  - `list(query)` (src/models/Jobs.js:11–91):
    - Loại bỏ lọc theo `query.location` (src/models/Jobs.js:13).
    - Thêm lọc mới qua quan hệ `locationRef`:
      - `province`, `city`, `ward` (so khớp bằng chuỗi hoặc `contains`).
      - `addressContains` để tìm theo nội dung địa chỉ.
    - `include: { sessions: true, skills: true, employer: true, locationRef: true }`.
  - `detail(id)` (src/models/Jobs.js:93–107): thêm `locationRef` vào `include`.
  - `create(userId, data)` (src/models/Jobs.js:109–139):
    - Bỏ kiểm tra bắt buộc `location` chuỗi (src/models/Jobs.js:113–117).
    - Yêu cầu `data.location` là object `{ province, city, ward?, address }`.
    - Tạo `Job` → tạo `JobLocation` → cập nhật `Job.locationId` trong `prisma.$transaction`.
  - `update(userId, id, data)` (src/models/Jobs.js:158–187):
    - Bỏ cập nhật trường `location` chuỗi (src/models/Jobs.js:163–165).
    - Nếu có `data.location` object: cập nhật/ tạo `JobLocation` tương ứng và đảm bảo `locationId`.
  - Thêm hàm:
    - `getLocation(jobId)` → trả về `JobLocation`.
    - `updateLocation(userId, jobId, body)` → cập nhật riêng địa chỉ (kiểm tra owner), chạy trong transaction.

## Cập nhật Routes & Controller
- `src/routes/jobsRoutes.js` (src/routes/jobsRoutes.js:9–16):
  - Thêm route:
    - `GET /api/jobs/:id/location` → `ctrl.getLocation`.
    - `PATCH /api/jobs/:id/location` (yêu cầu xác thực + verified) → `ctrl.updateLocation`.
- `src/controllers/jobsController.js`:
  - Thêm handler `getLocation` và `updateLocation` (theo pattern hàm sẵn có, ví dụ src/controllers/jobsController.js:28–42).

## Cập nhật OpenAPI
- Sửa `src/docs/openapi.json`:
  - Xóa trường `location` khỏi schema `Job` (src/docs/openapi.json:67–74).
  - Thêm `locationId` (integer, nullable) và `locationDetail` tham chiếu `JobLocation` trong phản hồi `Job`.
  - Thêm schema `JobLocation`:
    ```json
    {
      "JobLocation": {
        "type": "object",
        "properties": {
          "jobId": { "type": "integer" },
          "province": { "type": "string" },
          "city": { "type": "string" },
          "ward": { "type": "string", "nullable": true },
          "address": { "type": "string" }
        }
      }
    }
    ```
  - Mở rộng `GET /api/jobs` để hỗ trợ query `province`, `city`, `ward`, `addressContains`.
  - Thêm paths:
    - `GET /api/jobs/{id}/location` (200 trả `JobLocation`).
    - `PATCH /api/jobs/{id}/location` (BearerAuth, body là `JobLocation` không gồm `jobId`).

## Kiểm thử & Xác minh
- Sau `migrate reset`, chạy flow:
  - Tạo Job với `location` object → kiểm tra `JobLocation` và `jobs.locationId`.
  - `GET /api/jobs/:id` phải trả về `locationRef`.
  - `PATCH /api/jobs/:id/location` cập nhật thành công.
  - Lọc `GET /api/jobs` theo `province/city/ward/addressContains` hoạt động đúng.

## Lưu ý an toàn
- `migrate reset` sẽ xóa toàn bộ dữ liệu; chỉ chạy trên môi trường dev/test theo yêu cầu.
- Nếu có môi trường production, cần xác nhận riêng và backup trước khi thực hiện.
