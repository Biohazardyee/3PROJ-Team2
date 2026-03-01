/*
  Warnings:

  - A unique constraint covering the columns `[api_id]` on the table `Caches` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Caches_api_id_key" ON "Caches"("api_id");
