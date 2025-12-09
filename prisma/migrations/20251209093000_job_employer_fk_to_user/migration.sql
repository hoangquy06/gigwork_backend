-- Drop existing FK from Job.employerId to EmployerProfile.id
ALTER TABLE "Job" DROP CONSTRAINT IF EXISTS "Job_employerId_fkey";

-- Rewrite employerId values from EmployerProfile.id to EmployerProfile.userId
UPDATE "Job" j
SET "employerId" = ep."userId"
FROM "EmployerProfile" ep
WHERE ep."id" = j."employerId";

-- Add new FK from Job.employerId to User.id
ALTER TABLE "Job"
ADD CONSTRAINT "Job_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

