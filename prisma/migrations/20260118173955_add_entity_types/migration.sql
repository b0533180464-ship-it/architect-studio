-- CreateTable
CREATE TABLE "entity_types" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "namePlural" TEXT NOT NULL,
    "nameEn" TEXT,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "description" TEXT,
    "showInNav" BOOLEAN NOT NULL DEFAULT true,
    "navParentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entity_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generic_entities" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generic_entities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "entity_types_tenantId_idx" ON "entity_types"("tenantId");

-- CreateIndex
CREATE INDEX "entity_types_tenantId_isActive_idx" ON "entity_types"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "entity_types_tenantId_slug_key" ON "entity_types"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "generic_entities_tenantId_entityTypeId_idx" ON "generic_entities"("tenantId", "entityTypeId");

-- CreateIndex
CREATE INDEX "generic_entities_tenantId_entityTypeId_isActive_idx" ON "generic_entities"("tenantId", "entityTypeId", "isActive");

-- AddForeignKey
ALTER TABLE "entity_types" ADD CONSTRAINT "entity_types_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generic_entities" ADD CONSTRAINT "generic_entities_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generic_entities" ADD CONSTRAINT "generic_entities_entityTypeId_fkey" FOREIGN KEY ("entityTypeId") REFERENCES "entity_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
