-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Folder" (
    "userId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Files" (
    "folderId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "public"."Session"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_userId_key" ON "public"."Folder"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Files_folderId_key" ON "public"."Files"("folderId");

-- AddForeignKey
ALTER TABLE "public"."Folder" ADD CONSTRAINT "Folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Files" ADD CONSTRAINT "Files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."Folder"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
