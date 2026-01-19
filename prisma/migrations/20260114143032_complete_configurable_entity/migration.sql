/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,entityType,code]` on the table `configurable_entities` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "configurable_entities" ADD COLUMN     "code" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "metadata" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "configurable_entities_tenantId_entityType_code_key" ON "configurable_entities"("tenantId", "entityType", "code");
