/*
  Warnings:

  - You are about to drop the `Files` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Files" DROP CONSTRAINT "Files_folderId_fkey";

-- DropTable
DROP TABLE "public"."Files";

-- CreateTable
CREATE TABLE "public"."File" (
    "fileName" TEXT NOT NULL,
    "folderId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "File_fileName_key" ON "public"."File"("fileName");

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."Folder"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
