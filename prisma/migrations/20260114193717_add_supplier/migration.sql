-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "contactPerson" TEXT,
    "address" TEXT,
    "city" TEXT,
    "companyNumber" TEXT,
    "paymentTerms" TEXT,
    "discountPercent" DOUBLE PRECISION,
    "creditDays" INTEGER,
    "minimumOrder" DOUBLE PRECISION,
    "hasTradeAccount" BOOLEAN NOT NULL DEFAULT false,
    "tradeAccountNumber" TEXT,
    "tradeDiscountPercent" DOUBLE PRECISION,
    "rating" INTEGER,
    "reliabilityScore" INTEGER,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "suppliers_tenantId_idx" ON "suppliers"("tenantId");

-- CreateIndex
CREATE INDEX "suppliers_tenantId_categoryId_idx" ON "suppliers"("tenantId", "categoryId");

-- CreateIndex
CREATE INDEX "suppliers_tenantId_isActive_idx" ON "suppliers"("tenantId", "isActive");

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
