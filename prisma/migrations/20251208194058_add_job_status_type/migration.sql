-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('open', 'full', 'ongoing', 'completed');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('physical_work', 'fnb', 'event', 'retail', 'others');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'open',
ADD COLUMN     "type" "JobType" NOT NULL DEFAULT 'others';
