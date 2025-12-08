-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "isComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false;
