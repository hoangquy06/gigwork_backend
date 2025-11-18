## Hiện trạng nhanh
- Framework: NestJS + Express; ORM: TypeORM + PostgreSQL.
- User entity đã có: `src/entities/user.entity.ts`.
- Đăng ký hiện tại: `POST /auth/signup` tại `src/modules/auth/auth.controller.ts:19`, DTO ở `src/modules/auth/dto/signup.dto.ts:1-26` cho phép thêm `full_name`, `phone`, `role_worker`, `role_employer`.
- Xác thực JWT và ValidationPipe đã cấu hình (`src/main.ts:7-8`), Filter lỗi DB (`src/common/filters/database-exception.filter.ts`).

## Mục tiêu
1) Giới hạn Sign Up chỉ yêu cầu `email`, `password`.
2) Tạo REST API cập nhật hồ sơ (profile) sau khi người dùng chọn `role` là `employee` hoặc `employer`.
3) Lưu dữ liệu chung vào bảng `users`; dữ liệu chi tiết vào bảng `employee_profiles` hoặc `employer_profiles`.
4) Trả JSON theo yêu cầu với các trường cơ bản và trường bổ sung theo role.

## Thiết kế dữ liệu
- Bảng `users` (đã có): dùng các cột `email`, `password_hash`, `full_name` (lưu `name`), `phone`, trạng thái và cờ role.
- Tạo mới 2 entity + migration:
  - `employee_profiles`: khóa ngoại `user_id` (one-to-one), trường: `birth_date` (date), `gender` (enum: `male`, `female`, `other`).
  - `employer_profiles`: khóa ngoại `user_id` (one-to-one), trường: `company_name`, `company_address`.
- Ràng buộc: mỗi user chỉ có 1 profile theo đúng role; `role_worker` XOR `role_employer` trong `users`.

## API thiết kế (RESTful)
- Đăng ký: `POST /auth/signup`
  - Body JSON: `{ "email": string, "password": string }`
  - Response 201: `{ "id": number, "email": string }`
  - Thay đổi tại: `src/modules/auth/dto/signup.dto.ts` (chỉ giữ `email`, `password`), `src/modules/auth/auth.service.ts:createUser`, `src/modules/auth/auth.controller.ts:19`.
- Cập nhật hồ sơ nhân viên: `PUT /profile/employee`
  - Guard: `JwtAuthGuard`.
  - Body JSON: `{ "name": string, "email": string, "phone": string, "birth_date": YYYY-MM-DD, "gender": "male"|"female"|"other" }`
  - Xử lý:
    - Cập nhật `users.full_name=name`, `users.phone=phone`, xác nhận `email` khớp user hiện tại.
    - Set `users.role_worker=true`, `users.role_employer=false`.
    - Upsert `employee_profiles` theo `user_id`.
  - Response 200 JSON: `{ "id", "name", "email", "phone", "role": "employee", "birth_date", "gender" }`.
- Cập nhật hồ sơ nhà tuyển dụng: `PUT /profile/employer`
  - Guard: `JwtAuthGuard`.
  - Body JSON: `{ "name": string, "email": string, "phone": string, "company_name": string, "company_address": string }`
  - Xử lý:
    - Cập nhật `users.full_name`, `users.phone`.
    - Set `users.role_employer=true`, `users.role_worker=false`.
    - Upsert `employer_profiles` theo `user_id`.
  - Response 200 JSON: `{ "id", "name", "email", "phone", "role": "employer", "company_name", "company_address" }`.

## Validation theo role
- Dùng `class-validator` trong DTOs mới:
  - `UpdateEmployeeProfileDto`: `name` bắt buộc, `email` `@IsEmail`, `phone` regex 9–15 số, `birth_date` `@IsDateString`, `gender` `@IsEnum`.
  - `UpdateEmployerProfileDto`: `name`, `email`, `phone` như trên; thêm `company_name`, `company_address` bắt buộc.
- Global ValidationPipe đã bật (`whitelist`, `forbidNonWhitelisted`, `transform`).

## Xử lý lỗi
- 400 khi thiếu dữ liệu bắt buộc hoặc `email` body không khớp user.
- 409 khi xung đột dữ liệu DB (ví dụ `email`/`phone` trùng) — tự động qua `DatabaseExceptionFilter` (`src/common/filters/database-exception.filter.ts`).
- 403 khi user đã có role khác và muốn đổi trái quy định (nếu cần cưỡng chế một role duy nhất).
- 404 khi user không tồn tại (bất thường).

## Tổ chức code
- Tạo module `ProfileModule`:
  - Controller: `src/modules/profile/profile.controller.ts` với 2 endpoint `PUT /profile/employee` và `PUT /profile/employer`.
  - Service: `src/modules/profile/profile.service.ts` xử lý cập nhật `users` + upsert profile theo role.
  - DTOs: `src/modules/profile/dto/update-employee-profile.dto.ts`, `update-employer-profile.dto.ts`.
- Entities mới:
  - `src/entities/employee-profile.entity.ts`, `src/entities/employer-profile.entity.ts` (one-to-one với `User`).
- Đăng ký entities vào `TypeOrmModule.forFeature` và thêm vào `AppModule` (`src/app.module.ts`).
- Migration: thêm 2 migration tạo bảng `employee_profiles`, `employer_profiles` với khóa ngoại `user_id` và unique 1-1.

## Response chuẩn JSON
- Employee: `{ id, name, email, phone, role: "employee", birth_date, gender }`.
- Employer: `{ id, name, email, phone, role: "employer", company_name, company_address }`.

## Kiểm thử
- Đăng ký: `POST /auth/signup` với `{ "email": "a@b.com", "password": "P@ssw0rd" }`.
- Đăng nhập lấy JWT: `POST /auth/login` (`src/modules/auth/auth.controller.ts:9-17`).
- Cập nhật employee: `PUT /profile/employee` kèm Bearer token.
- Cập nhật employer: `PUT /profile/employer` kèm Bearer token.
- Kiểm tra phản hồi JSON và dữ liệu trong DB.

## Lưu ý tương thích
- Giữ nguyên chuẩn NestJS/TypeORM, dùng sẵn `JwtAuthGuard`, `DatabaseExceptionFilter`.
- Không thay đổi cấu trúc hiện có ngoài việc rút gọn `signup` và bổ sung module/profile + migrations.

Bạn xác nhận kế hoạch này để mình tiến hành triển khai và tạo migrations/DTOs/Controllers/Services tương ứng?