/*
  Warnings:

  - A unique constraint covering the columns `[api_id]` on the table `Medias` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Medias_api_id_key" ON "Medias"("api_id");
