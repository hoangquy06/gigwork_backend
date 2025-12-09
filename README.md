# Gigwork Backend v3

## Overview
Gigwork Backend cung cấp API cho nền tảng việc làm thời vụ, bao gồm xác thực người dùng, quản lý hồ sơ, tạo job, ứng tuyển, đánh giá, thông báo và quản lý ảnh hồ sơ. Ứng dụng chạy trên Node.js/NestJS (Express adapter), sử dụng Prisma ORM kết nối CSDL.

## System Architecture
- Request → middleware (auth, verified) → controller → model → Prisma → Database → Response
- Routers theo miền nghiệp vụ: `jobs`, `profiles`, `profileImages`, `applications`, `reviews`, `notifications`
- Middleware:
  - `authMiddleware`: xác thực JWT, gắn `req.user`
  - `requireVerified`: bắt buộc email đã xác minh cho các endpoint nhạy cảm
- Models xử lý nghiệp vụ và giao dịch prisma
- OpenAPI docs phục vụ qua `GET /api/openapi.json` và Swagger UI

## Tech Stack
- Runtime: Node.js
- Framework: NestJS (bootstrap) + Express Router
- Language: TypeScript (bootstrap) + JavaScript (CommonJS) cho controllers/models
- ORM: Prisma (`@prisma/client`)
- File Upload: Multer memoryStorage (tối đa 5MB)
- Auth: JWT
- API Docs: `swagger-ui-express` + `openapi.json`
