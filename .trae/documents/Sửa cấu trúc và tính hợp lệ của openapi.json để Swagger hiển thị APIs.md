## Mục tiêu
- Đảm bảo `openapi.json` hợp lệ theo OpenAPI 3.0.3, để Swagger UI hiển thị đầy đủ các API.
- Không thay đổi nội dung responses hay logic API, chỉ sửa cú pháp/cấu trúc spec.

## Vấn đề hiện tại
- Swagger UI báo lỗi: thiếu `paths`, sai khoá trong `components`, và "Object includes not allowed fields".
- Khả năng cao do JSON không hợp lệ (thừa/thiếu dấu `}` hoặc ký tự), hoặc UI đang nạp spec bị cache/nhúng.

## Các bước khắc phục (không thay đổi nội dung responses)
1. Sửa `openapi.json` để đảm bảo JSON hợp lệ:
   - Loại bỏ dấu `}` dư ở cuối file nếu có (đóng đúng 1 lần cho root object).
   - Kiểm tra và loại bỏ mọi dấu phẩy thừa, ký tự ngoài JSON, BOM.
   - Đảm bảo các khoá chỉ dùng ký tự hợp lệ (a-zA-Z0-9 . - _), ví dụ tên schema.
2. Đặt các trường top-level đúng chuẩn:
   - Trình tự khuyến nghị: `openapi`, `info`, `servers`, `tags` (tùy chọn), `paths`, `components`.
   - Giữ `paths` là khoá top-level (không nằm trong `components`). Nội dung `paths` giữ nguyên.
3. Giữ nguyên nội dung responses và schemas:
   - Không đổi status codes, không đổi cấu trúc response; chỉ đảm bảo cú pháp hợp lệ.
4. Đảm bảo Swagger UI nạp spec từ HTTP thay vì spec nhúng:
   - Sử dụng `swaggerUrl: '/api/openapi.json'` trong `main.ts` (đã cấu hình), để UI luôn fetch bản mới.
5. Kiểm tra hiển thị:
   - Reload cứng trang `/api/docs/` (Disable cache + Ctrl+F5).
   - Mở `/api/openapi.json` xác nhận đầy đủ `paths`.
   - Mở rộng từng `Tag` để thấy operations.

## Xác nhận kết quả
- Swagger UI hiển thị đầy đủ nhóm `Auth`, `Users`, `Jobs`, `Applications`, `Reviews`, `Notifications` với các API tương ứng.
- Không còn cảnh báo "should always have a 'paths' section" hay lỗi về `components`.

Nếu đồng ý, tôi sẽ chỉnh `openapi.json` theo các bước trên (loại bỏ `}` dư, đảm bảo cấu trúc và trật tự top-level), sau đó kiểm tra và xác nhận trên Swagger UI.