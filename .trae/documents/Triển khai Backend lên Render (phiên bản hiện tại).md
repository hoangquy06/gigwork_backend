## Phương án khôi phục
1) Khôi phục từ git stash (nếu đã cất trước khi pull/merge)
- Chạy: `git stash list`
- Nếu có WIP gần nhất: `git stash pop`
- Giải quyết conflict (nếu IDE báo), giữ nội dung local.

2) Nếu stash không có `.env`, tự khôi phục từ bản lưu trước
- Sao chép lại nội dung `.env` với các giá trị đã dùng:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=quyandkhoa123@
DB_NAME=postgres
JWT_SECRET=devsecret
DATABASE_URL=postgresql://postgres:quyandkhoa123%40@localhost:5432/postgres
PORT=3001
MAIL_FROM=quytvo2626@gmail.com
APP_URL=http://localhost:3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=quytvo26262@gmail.com
SMTP_PASS="xupq pexg utjz mkym"
```
- Lưu `.env` tại root dự án. Không commit `.env`.

3) Đảm bảo `.gitignore` hiệu lực
- `.gitignore` ở root cần có:
```
.env
.env.*
node_modules/
dist/
```
- Sau khi khôi phục `.env`, chạy `git status` để xác nhận `.env` không bị staged.

## Kiểm thử sau khôi phục
- `npm run start:dev` → kiểm tra app đọc env ổn.
- Thử `POST /api/auth/send-verification` (nếu SMTP thật), hoặc ở dev vẫn hoạt động với JSON transport.

Xác nhận để mình tiến hành khôi phục bằng stash nếu có, hoặc tạo lại `.env` với nội dung trên và đảm bảo `.gitignore` chặn theo dõi; sau đó chạy smoke test nhanh để xác nhận hệ thống ổn định.