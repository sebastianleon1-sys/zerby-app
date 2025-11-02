/*
  Warnings:

  - You are about to drop the column `creadoEn` on the `Anuncio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Anuncio" DROP COLUMN "creadoEn",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
