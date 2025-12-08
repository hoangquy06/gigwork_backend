$ErrorActionPreference = "Stop"
function PostJson($url, $body, $headers) { return Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json" -Headers $headers -Body ($body | ConvertTo-Json) }
function GetJson($url, $headers) { return Invoke-RestMethod -Uri $url -Method Get -Headers $headers }
$base = "http://localhost:3000"
$ts = [int](Get-Date -UFormat %s)
$workerEmail = "worker_$ts@example.com"
$employerEmail = "employer_$ts@example.com"
$password = "Test123!"
$wReg = PostJson "$base/api/auth/register" @{ email=$workerEmail; password=$password; isWorker=$true; isEmployer=$false } @{}
$eReg = PostJson "$base/api/auth/register" @{ email=$employerEmail; password=$password; isWorker=$false; isEmployer=$true } @{}
$wLogin = PostJson "$base/api/auth/login" @{ email=$workerEmail; password=$password } @{}
$eLogin = PostJson "$base/api/auth/login" @{ email=$employerEmail; password=$password } @{}
$wToken = $wLogin.token
$eToken = $eLogin.token
$wSend = PostJson "$base/api/auth/send-verification" @{} @{ Authorization = "Bearer $wToken" }
$eSend = PostJson "$base/api/auth/send-verification" @{} @{ Authorization = "Bearer $eToken" }
if ($wSend.link) { $null = GetJson "$base/api/auth/verify-email?token=$($wSend.link.Split('=')[-1])" @{} }
if ($eSend.link) { $null = GetJson "$base/api/auth/verify-email?token=$($eSend.link.Split('=')[-1])" @{} }
$wLogin = PostJson "$base/api/auth/login" @{ email=$workerEmail; password=$password } @{}
$eLogin = PostJson "$base/api/auth/login" @{ email=$employerEmail; password=$password } @{}
$wToken = $wLogin.token
$eToken = $eLogin.token
$wProfile = PostJson "$base/api/profiles/employee" @{ bio = "Hard worker $ts" } @{ Authorization = "Bearer $wToken" }
$eProfile = PostJson "$base/api/profiles/employer" @{ companyName = "ACME $ts"; companyAddress = "Hanoi" } @{ Authorization = "Bearer $eToken" }
$startDate = (Get-Date).AddDays(-2).ToString("o")
$job = PostJson "$base/api/jobs" @{ title = "Waiter $ts"; description = "Serve food"; location = "Hanoi"; startDate = $startDate; durationDays = 2; workerQuota = 2 } @{ Authorization = "Bearer $eToken" }
$null = PostJson "$base/api/jobs/$($job.id)/skills" @{ skills = @("waiter","cashier") } @{ Authorization = "Bearer $eToken" }
$sessionDate = (Get-Date).AddDays(6).ToString("yyyy-MM-dd")
$startTime = (Get-Date).AddDays(6).Date.AddHours(9).ToString("o")
$endTime = (Get-Date).AddDays(6).Date.AddHours(17).ToString("o")
$null = PostJson "$base/api/jobs/$($job.id)/sessions" @{ sessionDate = $sessionDate; startTime = $startTime; endTime = $endTime } @{ Authorization = "Bearer $eToken" }
$jobs = GetJson "$base/api/jobs" @{}
$detail = GetJson "$base/api/jobs/$($job.id)" @{}
$applyResp = PostJson "$base/api/applications" @{ jobId = $job.id } @{ Authorization = "Bearer $wToken" }
$application = $applyResp.application
$employeeDto = $applyResp.employee
$acc = PostJson "$base/api/applications/accept" @{ applicationId = $application.id } @{ Authorization = "Bearer $eToken" }
$wNoti = GetJson "$base/api/notifications" @{ Authorization = "Bearer $wToken" }
$completeApp = PostJson "$base/api/applications/complete" @{ applicationId = $application.id } @{ Authorization = "Bearer $wToken" }
$empReview = PostJson "$base/api/reviews" @{ applicationId = $application.id; revieweeId = $employeeDto.id; rating = 5; comment = "Great work" } @{ Authorization = "Bearer $eToken" }
$workerReview = PostJson "$base/api/reviews" @{ applicationId = $application.id; revieweeId = $eProfile.userId; rating = 5; comment = "Great employer" } @{ Authorization = "Bearer $wToken" }
$eNoti = GetJson "$base/api/notifications" @{ Authorization = "Bearer $eToken" }
$cancel = PostJson "$base/api/applications/cancel" @{ jobId = $job.id } @{ Authorization = "Bearer $wToken" }
$complete = PostJson "$base/api/applications/complete" @{ jobId = $job.id } @{ Authorization = "Bearer $wToken" }
$out = [ordered]@{ workerEmail=$workerEmail; employerEmail=$employerEmail; workerProfile=$wProfile; employerProfile=$eProfile; job=$job; jobsList=$jobs; jobDetail=$detail; apply=$applyResp; accept=$acc; workerNotifications=$wNoti; complete=$completeApp; employerNotifications=$eNoti; cancel=$cancel; empReview=$empReview; workerReview=$workerReview }
$out | ConvertTo-Json -Depth 6
