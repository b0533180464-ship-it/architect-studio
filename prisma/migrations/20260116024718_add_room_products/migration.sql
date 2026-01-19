-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT,
    "categoryId" TEXT,
    "supplierId" TEXT,
    "supplierSku" TEXT,
    "costPrice" DOUBLE PRECISION,
    "retailPrice" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "depth" DOUBLE PRECISION,
    "unit" TEXT NOT NULL DEFAULT 'cm',
    "leadTimeDays" INTEGER,
    "imageUrl" TEXT,
    "images" JSONB NOT NULL DEFAULT '[]',
    "productUrl" TEXT,
    "specSheetUrl" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_products" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "retailPrice" DOUBLE PRECISION,
    "clientPrice" DOUBLE PRECISION NOT NULL,
    "markupPercent" DOUBLE PRECISION,
    "clientApprovalStatus" TEXT NOT NULL DEFAULT 'pending',
    "clientApprovedAt" TIMESTAMP(3),
    "clientFeedback" TEXT,
    "procurementStatus" TEXT NOT NULL DEFAULT 'not_ordered',
    "purchaseOrderId" TEXT,
    "orderDate" TIMESTAMP(3),
    "vendorOrderNumber" TEXT,
    "estimatedLeadTime" INTEGER,
    "estimatedDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "trackingNumber" TEXT,
    "carrier" TEXT,
    "installationRequired" BOOLEAN NOT NULL DEFAULT false,
    "installedAt" TIMESTAMP(3),
    "installedBy" TEXT,
    "hasIssue" BOOLEAN NOT NULL DEFAULT false,
    "issueType" TEXT,
    "issueDescription" TEXT,
    "issueResolvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "internalNotes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "vendorOrderNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDelivery" TIMESTAMP(3),
    "actualDelivery" TIMESTAMP(3),
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vatAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "paymentTerms" TEXT,
    "deliveryAddress" TEXT,
    "deliveryInstructions" TEXT,
    "notes" TEXT,
    "internalNotes" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "productId" TEXT,
    "roomProductId" TEXT,
    "roomId" TEXT,
    "description" TEXT NOT NULL,
    "sku" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "deliveredQuantity" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_tracking" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "purchaseOrderItemId" TEXT,
    "roomProductId" TEXT,
    "supplierId" TEXT NOT NULL,
    "vendorOrderNumber" TEXT,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "estimatedShipDate" TIMESTAMP(3),
    "actualShipDate" TIMESTAMP(3),
    "estimatedDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "trackingNumber" TEXT,
    "carrier" TEXT,
    "trackingUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ordered',
    "originalLeadTimeDays" INTEGER,
    "currentLeadTimeDays" INTEGER,
    "delayDays" INTEGER,
    "delayReason" TEXT,
    "hasIssue" BOOLEAN NOT NULL DEFAULT false,
    "issueType" TEXT,
    "issueDescription" TEXT,
    "issueResolvedAt" TIMESTAMP(3),
    "statusHistory" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "communication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_tenantId_idx" ON "products"("tenantId");

-- CreateIndex
CREATE INDEX "products_supplierId_idx" ON "products"("supplierId");

-- CreateIndex
CREATE INDEX "products_tenantId_categoryId_idx" ON "products"("tenantId", "categoryId");

-- CreateIndex
CREATE INDEX "products_tenantId_isActive_idx" ON "products"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "products_tenantId_sku_key" ON "products"("tenantId", "sku");

-- CreateIndex
CREATE INDEX "room_products_tenantId_idx" ON "room_products"("tenantId");

-- CreateIndex
CREATE INDEX "room_products_projectId_idx" ON "room_products"("projectId");

-- CreateIndex
CREATE INDEX "room_products_roomId_idx" ON "room_products"("roomId");

-- CreateIndex
CREATE INDEX "room_products_productId_idx" ON "room_products"("productId");

-- CreateIndex
CREATE INDEX "room_products_tenantId_clientApprovalStatus_idx" ON "room_products"("tenantId", "clientApprovalStatus");

-- CreateIndex
CREATE INDEX "room_products_tenantId_procurementStatus_idx" ON "room_products"("tenantId", "procurementStatus");

-- CreateIndex
CREATE INDEX "room_products_projectId_roomId_idx" ON "room_products"("projectId", "roomId");

-- CreateIndex
CREATE INDEX "purchase_orders_tenantId_idx" ON "purchase_orders"("tenantId");

-- CreateIndex
CREATE INDEX "purchase_orders_projectId_idx" ON "purchase_orders"("projectId");

-- CreateIndex
CREATE INDEX "purchase_orders_supplierId_idx" ON "purchase_orders"("supplierId");

-- CreateIndex
CREATE INDEX "purchase_orders_tenantId_status_idx" ON "purchase_orders"("tenantId", "status");

-- CreateIndex
CREATE INDEX "purchase_orders_tenantId_orderDate_idx" ON "purchase_orders"("tenantId", "orderDate");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_tenantId_orderNumber_key" ON "purchase_orders"("tenantId", "orderNumber");

-- CreateIndex
CREATE INDEX "purchase_order_items_purchaseOrderId_idx" ON "purchase_order_items"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "purchase_order_items_productId_idx" ON "purchase_order_items"("productId");

-- CreateIndex
CREATE INDEX "purchase_order_items_roomProductId_idx" ON "purchase_order_items"("roomProductId");

-- CreateIndex
CREATE INDEX "delivery_tracking_tenantId_idx" ON "delivery_tracking"("tenantId");

-- CreateIndex
CREATE INDEX "delivery_tracking_purchaseOrderId_idx" ON "delivery_tracking"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "delivery_tracking_roomProductId_idx" ON "delivery_tracking"("roomProductId");

-- CreateIndex
CREATE INDEX "delivery_tracking_supplierId_idx" ON "delivery_tracking"("supplierId");

-- CreateIndex
CREATE INDEX "delivery_tracking_tenantId_status_idx" ON "delivery_tracking"("tenantId", "status");

-- CreateIndex
CREATE INDEX "delivery_tracking_tenantId_estimatedDeliveryDate_idx" ON "delivery_tracking"("tenantId", "estimatedDeliveryDate");

-- CreateIndex
CREATE INDEX "delivery_tracking_tenantId_hasIssue_idx" ON "delivery_tracking"("tenantId", "hasIssue");

-- CreateIndex
CREATE INDEX "activity_logs_tenantId_idx" ON "activity_logs"("tenantId");

-- CreateIndex
CREATE INDEX "activity_logs_tenantId_entityType_entityId_idx" ON "activity_logs"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "activity_logs_tenantId_userId_idx" ON "activity_logs"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "communication_logs_tenantId_idx" ON "communication_logs"("tenantId");

-- CreateIndex
CREATE INDEX "communication_logs_tenantId_clientId_idx" ON "communication_logs"("tenantId", "clientId");

-- CreateIndex
CREATE INDEX "communication_logs_clientId_createdAt_idx" ON "communication_logs"("clientId", "createdAt");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_products" ADD CONSTRAINT "room_products_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_products" ADD CONSTRAINT "room_products_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_products" ADD CONSTRAINT "room_products_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_products" ADD CONSTRAINT "room_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_roomProductId_fkey" FOREIGN KEY ("roomProductId") REFERENCES "room_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_tracking" ADD CONSTRAINT "delivery_tracking_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_tracking" ADD CONSTRAINT "delivery_tracking_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_tracking" ADD CONSTRAINT "delivery_tracking_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_tracking" ADD CONSTRAINT "delivery_tracking_roomProductId_fkey" FOREIGN KEY ("roomProductId") REFERENCES "room_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
