-- AlterTable
ALTER TABLE "Job" DROP COLUMN "location",
ADD COLUMN     "locationId" INTEGER,
ADD COLUMN     "sessionId" INTEGER,
ADD COLUMN     "skillId" INTEGER;

-- AlterTable
ALTER TABLE "JobRequiredSkill" DROP CONSTRAINT "JobRequiredSkill_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "JobRequiredSkill_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "JobLocation" (
    "jobId" INTEGER NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "ward" TEXT,
    "address" TEXT NOT NULL,

    CONSTRAINT "JobLocation_pkey" PRIMARY KEY ("jobId")
);

-- CreateIndex
CREATE INDEX "JobLocation_province_city_ward_idx" ON "JobLocation"("province", "city", "ward");

-- CreateIndex
CREATE UNIQUE INDEX "Job_locationId_key" ON "Job"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_sessionId_key" ON "Job"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_skillId_key" ON "Job"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "JobRequiredSkill_jobId_skillName_key" ON "JobRequiredSkill"("jobId", "skillName");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "JobLocation"("jobId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "JobSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "JobRequiredSkill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLocation" ADD CONSTRAINT "JobLocation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
