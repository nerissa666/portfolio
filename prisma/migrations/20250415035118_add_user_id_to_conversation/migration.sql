/*
  Warnings:

  - Added the required column `userId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");
