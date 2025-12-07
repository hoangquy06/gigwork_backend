## Mục tiêu
- Tạo tài liệu API (Swagger UI) cho toàn bộ endpoints hiện có.
- Công bố đặc tả OpenAPI ở `/api/openapi.json` và UI ở `/api/docs`.

## Cách tiếp cận phù hợp với dự án
- Do các API hiện khai báo qua Express Router (không dùng decorators Nest), sử dụng `swagger-ui-express` để phục vụ tài liệu.
- Viết đặc tả OpenAPI 3.0 thủ công (JSON) dựa trên các endpoint đã triển khai.

## Bước triển khai
1) Thêm phụ thuộc
- Cài `swagger-ui-express` vào dự án.

2) Tạo đặc tả OpenAPI
- Tạo `src/docs/openapi.json` (hoặc `.yaml`) gồm:
  - `openapi: 3.0.3`, `info` (title, version, description)
  - `servers`: `http://localhost:3000`, `https://gigwork-backend.onrender.com`
  - `components.securitySchemes.BearerAuth`: kiểu `http`, scheme `bearer`, bearerFormat `JWT`
  - `components.schemas`: mô tả các entity chính (User, EmployeeProfile, EmployerProfile, Job, JobSession, JobRequiredSkill, JobApplication, Review, Notification) và response chuẩn (`AuthToken`, `ErrorResponse`)
  - `security`: `[ { BearerAuth: [] } ]` (mặc định cho endpoint cần JWT)
  - `paths`: mô tả request/response cho từng endpoint:
    - Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/send-verification`, `GET /api/auth/verify-email`
    - Users: `GET /api/users/me`, `PATCH /api/users/me`
    - Profiles: `POST/PATCH /api/profiles/employee|employer`
    - Jobs: `GET /api/jobs`, `GET /api/jobs/{id}`, `POST/PATCH/DELETE /api/jobs`, `POST /api/jobs/{id}/sessions`, `GET /api/jobs/{id}/sessions`, `POST /api/jobs/{id}/skills`
    - Applications: `POST /api/applications`, `POST /api/applications/{id}/accept|confirm|complete|cancel`
    - Reviews: `POST /api/reviews`, `GET /api/reviews/{userId}`
    - Notifications: `GET /api/notifications`

3) Mount Swagger UI
- Trong `src/main.ts`:
  - `import * as swaggerUi from 'swagger-ui-express'`
  - Đọc file `openapi.json` và `http.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec))`
  - Thêm route `http.get('/api/openapi.json', ...)` trả nguyên JSON đặc tả.

4) Quy ước cập nhật
- Mỗi khi thêm/chỉnh sửa API, cập nhật `openapi.json` tương ứng (requestBody/parameters/response/errors).
- Sử dụng `$ref` để tái sử dụng schema, giúp spec ngắn gọn.

## Kiểm thử
- Local: `npm run start:dev` → `http://localhost:3000/api/docs`
- Render: `https://gigwork-backend.onrender.com/api/docs`
- Dùng nút “Authorize” (BearerAuth) để nhập JWT và thử trực tiếp các endpoint yêu cầu xác thực.

## Tùy chọn nâng cao
- Nếu sau này chuyển controllers sang Nest decorators, có thể dùng `@nestjs/swagger` để sinh spec tự động.
- Tách file spec thành nhiều module và dùng bundler (ví dụ `swagger-jsdoc`) nếu muốn viết spec bằng JSDoc.

Xác nhận kế hoạch để mình tiến hành thêm dependency, tạo file `src/docs/openapi.json`, mount Swagger UI và kiểm thử ở `/api/docs`. 