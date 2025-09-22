/*
  Warnings:

  - The primary key for the `File` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `file_id` on the `File` table. All the data in the column will be lost.
  - The primary key for the `Folder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `folder_id` on the `Folder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."File" DROP CONSTRAINT "File_pkey",
DROP COLUMN "file_id",
ADD COLUMN     "fileId" SERIAL NOT NULL,
ADD CONSTRAINT "File_pkey" PRIMARY KEY ("fileId");

-- AlterTable
ALTER TABLE "public"."Folder" DROP CONSTRAINT "Folder_pkey",
DROP COLUMN "folder_id",
ADD COLUMN     "folderId" SERIAL NOT NULL,
ADD CONSTRAINT "Folder_pkey" PRIMARY KEY ("folderId");
