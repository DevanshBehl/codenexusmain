-- CreateTable
CREATE TABLE "ca_problems" (
    "id" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" VARCHAR(10) NOT NULL,
    "tags" TEXT[],
    "constraints" TEXT,
    "input_format" TEXT,
    "output_format" TEXT,
    "time_limit_ms" INTEGER NOT NULL DEFAULT 2000,
    "memory_limit_mb" INTEGER NOT NULL DEFAULT 256,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ca_problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ca_test_cases" (
    "id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "input" TEXT NOT NULL,
    "expected_output" TEXT NOT NULL,
    "is_sample" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ca_test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ca_submissions" (
    "id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "student_cnid" TEXT,
    "language" VARCHAR(30) NOT NULL,
    "code" TEXT NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "judge0_tokens" TEXT[],
    "time_taken_ms" INTEGER,
    "memory_used_kb" INTEGER,
    "test_cases_passed" INTEGER NOT NULL DEFAULT 0,
    "test_cases_total" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ca_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ca_run_results" (
    "id" UUID NOT NULL,
    "student_cnid" TEXT,
    "problem_id" UUID NOT NULL,
    "language" VARCHAR(30),
    "code" TEXT,
    "custom_input" TEXT,
    "actual_output" TEXT,
    "expected" TEXT,
    "status" VARCHAR(30),
    "time_ms" INTEGER,
    "memory_kb" INTEGER,
    "ran_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ca_run_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ca_submission_summary" (
    "student_cnid" TEXT NOT NULL,
    "problem_id" UUID NOT NULL,
    "is_solved" BOOLEAN NOT NULL DEFAULT false,
    "best_time_ms" INTEGER,
    "total_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_submitted_at" TIMESTAMP(3),

    CONSTRAINT "ca_submission_summary_pkey" PRIMARY KEY ("student_cnid","problem_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ca_problems_slug_key" ON "ca_problems"("slug");

-- CreateIndex
CREATE INDEX "ca_test_cases_problem_id_is_sample_order_index_idx" ON "ca_test_cases"("problem_id", "is_sample", "order_index");

-- CreateIndex
CREATE INDEX "ca_submissions_student_cnid_problem_id_idx" ON "ca_submissions"("student_cnid", "problem_id");

-- CreateIndex
CREATE INDEX "ca_submissions_status_idx" ON "ca_submissions"("status");

-- CreateIndex
CREATE INDEX "ca_submission_summary_student_cnid_is_solved_idx" ON "ca_submission_summary"("student_cnid", "is_solved");

-- AddForeignKey
ALTER TABLE "ca_test_cases" ADD CONSTRAINT "ca_test_cases_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "ca_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ca_submissions" ADD CONSTRAINT "ca_submissions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "ca_problems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ca_submissions" ADD CONSTRAINT "ca_submissions_student_cnid_fkey" FOREIGN KEY ("student_cnid") REFERENCES "User"("cnid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ca_run_results" ADD CONSTRAINT "ca_run_results_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "ca_problems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ca_run_results" ADD CONSTRAINT "ca_run_results_student_cnid_fkey" FOREIGN KEY ("student_cnid") REFERENCES "User"("cnid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ca_submission_summary" ADD CONSTRAINT "ca_submission_summary_student_cnid_fkey" FOREIGN KEY ("student_cnid") REFERENCES "User"("cnid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ca_submission_summary" ADD CONSTRAINT "ca_submission_summary_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "ca_problems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
