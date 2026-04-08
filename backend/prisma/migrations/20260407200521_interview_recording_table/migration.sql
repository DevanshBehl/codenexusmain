-- AlterTable
ALTER TABLE "Recording" ALTER COLUMN "videoUrl" DROP NOT NULL,
ALTER COLUMN "durationStr" DROP NOT NULL;

-- CreateTable
CREATE TABLE "InterviewRecording" (
    "id" TEXT NOT NULL,
    "interview_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'recording',
    "file_path" TEXT,
    "file_size_bytes" BIGINT,
    "duration_seconds" INTEGER,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,

    CONSTRAINT "InterviewRecording_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewRecording_interview_id_key" ON "InterviewRecording"("interview_id");

-- CreateIndex
CREATE INDEX "InterviewRecording_interview_id_idx" ON "InterviewRecording"("interview_id");

-- AddForeignKey
ALTER TABLE "InterviewRecording" ADD CONSTRAINT "InterviewRecording_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
