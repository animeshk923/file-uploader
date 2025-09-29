/*
  Warnings:

  - You are about to alter the column `fileSize` on the `File` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,3)`.

*/
-- AlterTable
ALTER TABLE "public"."File" ALTER COLUMN "fileSize" SET DATA TYPE DECIMAL(10,3);
