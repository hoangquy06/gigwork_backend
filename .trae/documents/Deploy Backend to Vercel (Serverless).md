## Mục tiêu

* Tạo nhánh mới `version` từ `develop` trên repo `hoangquy06/gigwork_backend`.

* Đưa toàn bộ code hiện tại lên `version` (ghi đè hoàn toàn so với develop/main).

* Hợp nhất `version → develop` và (tùy chọn) `develop → main` với xử lý xung đột tự động ưu tiên code từ `version`.

## Chuẩn bị

* Đảm bảo code hiện tại đã sẵn sàng commit (đã chạy build/migrate và kiểm thử cơ bản).

* Kiểm tra `.gitignore` phù hợp (bỏ `node_modules`, `dist`, môi trường local…).

## Quy trình Git (CLI)

1. Kết nối remote

* `git remote add origin git@github.com:hoangquy06/gigwork_backend.git` (hoặc HTTPS)

* `git fetch --all --prune`

1. Tạo nhánh version từ develop

* `git checkout develop`

* `git pull origin develop`

* `git checkout -b version`

1. Thay thế toàn bộ nội dung bằng code hiện tại

* Xóa sạch nội dung nhánh `version` (giữ `.git`):

  * Ví dụ: xóa mọi file được track: `git rm -r *` (giữ ý, tránh xóa các file cấu hình git cần thiết nếu nằm ngoài repo)

* Sao chép toàn bộ code hiện tại vào working tree.

* `git add .`

* `git commit -m "feat(version): new backend version"`

* `git push -u origin version`

1. Hợp nhất vào develop với ưu tiên code từ version

* `git checkout develop`

* `git pull origin develop`

* `git merge --no-ff -X theirs version`

* `git push origin develop`

1. (Tùy chọn) Cập nhật main từ develop với cùng chiến lược

* `git checkout main`

* `git pull origin main`

* `git merge --no-ff -X theirs develop`

* `git push origin main`

## Giải thích xử lý xung đột

* Cờ `-X theirs` khi merge trên nhánh đích sẽ ưu tiên thay đổi của nhánh được merge (ở đây là `version` khi merge vào `develop`, và `develop` khi merge vào `main`).

* Nếu muốn “ghi đè hoàn toàn” không xét diff, có thể dùng `git merge -s ours` (ghi nhận merge nhưng giữ nguyên nội dung nhánh hiện tại). Tuy nhiên mục tiêu của bạn là lấy nội dung từ `version`, nên `-X theirs` là phù hợp.

## Kiểm tra sau hợp nhất

* Chạy `npm ci && npx prisma generate && npm run build`.

* Chạy thử `npm run start:dev` và thực hiện smoke tests (auth, users/me, jobs filters, applications flow…).

## Lưu ý bảo mật

* Không commit `.env` thực tế; dùng `.env.example` đã xóa dữ liệu chỉ giữ lại các biến trống. 

* Thêm secrets trong CI/CD hoặc nền tảng deploy (Render/Vercel) bằng biến môi trường.

Xác nhận để mình viết kịch bản lệnh (PowerShell/Bash) tự động hóa các bước trên và chuẩn bị PRs/merge yêu cầu với chiến lược `-X theirs`.
