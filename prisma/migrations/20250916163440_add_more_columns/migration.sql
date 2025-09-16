/*
  Warnings:

  - A unique constraint covering the columns `[fileName]` on the table `Files` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[FolderName]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileName` to the `Files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `FolderName` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Files_folderId_key";

-- AlterTable
ALTER TABLE "public"."Files" ADD COLUMN     "fileName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Folder" ADD COLUMN     "FolderName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Files_fileName_key" ON "public"."Files"("fileName");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_FolderName_key" ON "public"."Folder"("FolderName");
