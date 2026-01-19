-- CreateTable
CREATE TABLE "relation_definitions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "sourceEntityType" TEXT NOT NULL,
    "targetEntityType" TEXT NOT NULL,
    "relationType" TEXT NOT NULL DEFAULT 'many_to_many',
    "isBidirectional" BOOLEAN NOT NULL DEFAULT false,
    "inverseName" TEXT,
    "displayFields" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relation_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_relations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "relationDefId" TEXT NOT NULL,
    "sourceEntityType" TEXT NOT NULL,
    "sourceEntityId" TEXT NOT NULL,
    "targetEntityType" TEXT NOT NULL,
    "targetEntityId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_relations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "relation_definitions_tenantId_sourceEntityType_idx" ON "relation_definitions"("tenantId", "sourceEntityType");

-- CreateIndex
CREATE INDEX "relation_definitions_tenantId_targetEntityType_idx" ON "relation_definitions"("tenantId", "targetEntityType");

-- CreateIndex
CREATE UNIQUE INDEX "relation_definitions_tenantId_sourceEntityType_fieldKey_key" ON "relation_definitions"("tenantId", "sourceEntityType", "fieldKey");

-- CreateIndex
CREATE INDEX "entity_relations_tenantId_sourceEntityType_sourceEntityId_idx" ON "entity_relations"("tenantId", "sourceEntityType", "sourceEntityId");

-- CreateIndex
CREATE INDEX "entity_relations_tenantId_targetEntityType_targetEntityId_idx" ON "entity_relations"("tenantId", "targetEntityType", "targetEntityId");

-- CreateIndex
CREATE INDEX "entity_relations_relationDefId_idx" ON "entity_relations"("relationDefId");

-- CreateIndex
CREATE UNIQUE INDEX "entity_relations_relationDefId_sourceEntityId_targetEntityI_key" ON "entity_relations"("relationDefId", "sourceEntityId", "targetEntityId");

-- AddForeignKey
ALTER TABLE "relation_definitions" ADD CONSTRAINT "relation_definitions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_relations" ADD CONSTRAINT "entity_relations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_relations" ADD CONSTRAINT "entity_relations_relationDefId_fkey" FOREIGN KEY ("relationDefId") REFERENCES "relation_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
