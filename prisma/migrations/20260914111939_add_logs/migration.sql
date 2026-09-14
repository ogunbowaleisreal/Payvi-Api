-- CreateTable
CREATE TABLE "logs" (
    "id" UUID NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "request_id" TEXT,
    "user_id" TEXT,
    "method" TEXT,
    "path" TEXT,
    "status_code" INTEGER,
    "duration" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "logs_level_idx" ON "logs"("level");

-- CreateIndex
CREATE INDEX "logs_created_at_idx" ON "logs"("created_at");

-- CreateIndex
CREATE INDEX "logs_request_id_idx" ON "logs"("request_id");

-- CreateIndex
CREATE INDEX "logs_user_id_idx" ON "logs"("user_id");
