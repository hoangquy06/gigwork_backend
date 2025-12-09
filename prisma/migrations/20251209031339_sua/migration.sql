-- CreateEnum
CREATE TYPE "ProfileRole" AS ENUM ('employee', 'employer');

-- CreateEnum
CREATE TYPE "ImageKind" AS ENUM ('avatar', 'company_logo', 'other');

-- CreateTable
CREATE TABLE "ProfileImage" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "ProfileRole" NOT NULL,
    "kind" "ImageKind" NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileImage_userId_role_idx" ON "ProfileImage"("userId", "role");

-- AddForeignKey
ALTER TABLE "ProfileImage" ADD CONSTRAINT "ProfileImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
