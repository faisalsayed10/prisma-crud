/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[name]` on the table `users`. If there are existing duplicate values, the migration will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users.name_unique" ON "users"("name");
