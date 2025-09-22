/*
  Warnings:

  - You are about to drop the column `FolderName` on the `Folder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[folderName]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `folderName` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Folder_FolderName_key";

-- AlterTable
ALTER TABLE "public"."File" ADD COLUMN     "file_id" SERIAL NOT NULL,
ADD CONSTRAINT "File_pkey" PRIMARY KEY ("file_id");

-- AlterTable
ALTER TABLE "public"."Folder" DROP COLUMN "FolderName",
ADD COLUMN     "folderName" TEXT NOT NULL,
ADD COLUMN     "folder_id" SERIAL NOT NULL,
ADD CONSTRAINT "Folder_pkey" PRIMARY KEY ("folder_id");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_folderName_key" ON "public"."Folder"("folderName");
