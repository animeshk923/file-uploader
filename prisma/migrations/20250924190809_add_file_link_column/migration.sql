/*
  Warnings:

  - A unique constraint covering the columns `[fileLink]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileLink` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."File" ADD COLUMN     "fileLink" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "File_fileLink_key" ON "public"."File"("fileLink");
