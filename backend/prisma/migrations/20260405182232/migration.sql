/*
  Warnings:

  - A unique constraint covering the columns `[cnid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cnid" TEXT;

-- CreateTable
CREATE TABLE "Mail" (
    "id" TEXT NOT NULL,
    "sender_cnid" TEXT NOT NULL,
    "recipient_cnid" TEXT NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted_sender" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted_recipient" BOOLEAN NOT NULL DEFAULT false,
    "thread_id" TEXT NOT NULL,
    "parent_mail_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailPermissionViolation" (
    "id" TEXT NOT NULL,
    "sender_cnid" TEXT NOT NULL,
    "attempted_recipient_cnid" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "MailPermissionViolation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Mail_recipient_cnid_is_read_is_deleted_recipient_idx" ON "Mail"("recipient_cnid", "is_read", "is_deleted_recipient");

-- CreateIndex
CREATE INDEX "Mail_sender_cnid_is_deleted_sender_idx" ON "Mail"("sender_cnid", "is_deleted_sender");

-- CreateIndex
CREATE INDEX "Mail_thread_id_idx" ON "Mail"("thread_id");

-- CreateIndex
CREATE INDEX "MailPermissionViolation_sender_cnid_timestamp_idx" ON "MailPermissionViolation"("sender_cnid", "timestamp");

-- CreateIndex
CREATE INDEX "MailPermissionViolation_timestamp_idx" ON "MailPermissionViolation"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "User_cnid_key" ON "User"("cnid");

-- AddForeignKey
ALTER TABLE "Mail" ADD CONSTRAINT "Mail_sender_cnid_fkey" FOREIGN KEY ("sender_cnid") REFERENCES "User"("cnid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mail" ADD CONSTRAINT "Mail_recipient_cnid_fkey" FOREIGN KEY ("recipient_cnid") REFERENCES "User"("cnid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mail" ADD CONSTRAINT "Mail_parent_mail_id_fkey" FOREIGN KEY ("parent_mail_id") REFERENCES "Mail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
