-- CreateTable
CREATE TABLE "Pr" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "create_at" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "repo_id" TEXT NOT NULL,
    "repo_name" TEXT NOT NULL,
    "repo_owner" TEXT NOT NULL,
    "push_branch" TEXT NOT NULL,
    "pull_branch" TEXT NOT NULL,
    "pull_number" TEXT NOT NULL,

    CONSTRAINT "Pr_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pr_id_key" ON "Pr"("id");

-- AddForeignKey
ALTER TABLE "Pr" ADD CONSTRAINT "Pr_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
