/*
  Warnings:

  - You are about to drop the column `fileLink` on the `File` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fileURL]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."File_fileLink_key";

-- AlterTable
ALTER TABLE "public"."File" DROP COLUMN "fileLink",
ADD COLUMN     "fileURL" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "File_fileURL_key" ON "public"."File"("fileURL");
