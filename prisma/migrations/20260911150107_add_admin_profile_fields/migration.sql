/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `admins` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "department" VARCHAR(100),
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "jobTitle" VARCHAR(100),
ADD COLUMN     "phone" VARCHAR(30);

-- CreateIndex
CREATE UNIQUE INDEX "admins_phone_key" ON "admins"("phone");
