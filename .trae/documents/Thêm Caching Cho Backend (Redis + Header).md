## Mục Tiêu
- Giảm tải DB và tăng tốc độ phản hồi cho các endpoint đọc (đặc biệt Jobs list/detail) bằng cache tầng ứng dụng.
- Kết hợp cache phía client thông qua HTTP headers (`Cache-Control`, `ETag`).

## Công Nghệ Khuyến Nghị
- Distributed cache: Redis (ổn định, có TTL, hỗ trợ invalidation tốt). Dùng `ioredis` hoặc `@nestjs/cache-manager` + `cache-manager-redis-store`.
- Fallback dev: In-memory cache (ví dụ `node-cache`) khi không có Redis.
- HTTP cache: `Cache-Control: public, max-age=<TTL>` cho các endpoint công khai; tận dụng `ETag` sẵn có của Express.

## Phạm Vi Áp Dụng
- Cache đọc:
  - `GET /api/jobs` (list): TTL 30–60s, key hoá theo query (province/city/skills/date…)
  - `GET /api/jobs/{id}` (detail): TTL 60–120s, key theo id
  - `GET /api/jobs/{id}/sessions`, `GET /api/jobs/{id}/skills`, `GET /api/jobs/{id}/location`: TTL 120s
- Không cache các endpoint thay đổi dữ liệu (POST/PATCH/DELETE) nhưng sẽ làm invalidation.

## Thiết Kế Key & TTL
- Key strategy: `jobs:list:{hash(query)}` và `jobs:detail:{id}`; `jobs:sessions:{id}`, `jobs:skills:{id}`, `jobs:location:{id}`.
- TTL: list 30–60s; detail và phụ 60–120s.

## Invalidation
- Khi `POST /api/jobs`, `PATCH /api/jobs/:id`, `DELETE /api/jobs/:id` hoặc `DELETE /api/jobs?jobId=...`:
  - Xoá `jobs:detail:{id}` và các key phụ theo id
  - Xoá/bỏ qua toàn bộ `jobs:list:*` (wildcard) hoặc đánh dấu version để không cần quét (key prefix với version tăng dần)

## Tích Hợp Kỹ Thuật
1. Tạo `src/services/cache.js`: wrapper cho Redis (hoặc in-memory), API: `get(key)`, `set(key, value, ttlSec)`, `del(key)`, `delByPrefix(prefix)`.
2. Tại controllers `jobsController.js`:
  - Ở `list`, tạo key từ query, thử `cache.get` trước; nếu miss thì query DB, set cache và trả response; thêm `Cache-Control` phù hợp.
  - Ở `detail`, tương tự với key theo id.
  - Ở `sessions/skills/location` GET, tương tự.
  - Ở các write endpoints (create/update/delete), gọi `cache.del`/`delByPrefix` để invalidation.
3. Env:
  - `REDIS_URL` (ví dụ `redis://localhost:6379`) và flag `CACHE_ENABLED=true`.
  - Fallback in-memory khi `CACHE_ENABLED=false` hoặc không có Redis.
4. HTTP headers:
  - Thêm `Cache-Control` cho các GET công khai: ví dụ `public, max-age=30` cho list, `public, max-age=60` cho detail.

## Kiểm Tra
- Seed dữ liệu, gọi GET list/detail lần đầu (miss) và lần sau (hit) — đo thời gian phản hồi.
- Thực hiện update/delete job — xác minh cache invalidation và dữ liệu mới được trả.
- Kiểm tra headers: `Cache-Control` và `ETag`.

## Mở Rộng
- Thêm metric/hit ratio và log để theo dõi hiệu quả cache.
- Có thể đặt short TTL riêng cho các filter heavy (nhiều tham số).
- Xem xét cache layer cho `Users.getMeDto` nếu cần (có invalidation theo userId).