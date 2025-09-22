/*
  Warnings:

  - A unique constraint covering the columns `[fileId]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[folderId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."File" DROP CONSTRAINT "File_folderId_fkey";

-- DropIndex
DROP INDEX "public"."Folder_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "File_fileId_key" ON "public"."File"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_folderId_key" ON "public"."Folder"("folderId");

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."Folder"("folderId") ON DELETE RESTRICT ON UPDATE CASCADE;
