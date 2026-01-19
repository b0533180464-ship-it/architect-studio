-- Step 1: Add new column targetEntityTypes as TEXT array
ALTER TABLE "relation_definitions" ADD COLUMN "targetEntityTypes" TEXT[];

-- Step 2: Migrate existing data - convert single targetEntityType to array
UPDATE "relation_definitions"
SET "targetEntityTypes" = ARRAY["targetEntityType"]
WHERE "targetEntityType" IS NOT NULL;

-- Step 3: Drop the index on targetEntityType
DROP INDEX IF EXISTS "relation_definitions_tenantId_targetEntityType_idx";

-- Step 4: Drop the old column
ALTER TABLE "relation_definitions" DROP COLUMN "targetEntityType";
