CREATE TYPE "RetailOrderStatus" AS ENUM ('DRAFT', 'CHECKOUT_STARTED', 'CONFIRMED', 'PICKING', 'DELIVERED', 'CANCELLED');

CREATE TABLE "RetailOrder" (
    "id" TEXT NOT NULL,
    "status" "RetailOrderStatus" NOT NULL DEFAULT 'CHECKOUT_STARTED',
    "provider" TEXT NOT NULL,
    "externalOrderId" TEXT,
    "checkoutUrl" TEXT NOT NULL,
    "deliveryEircode" TEXT NOT NULL,
    "deliverySlot" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL,
    "minimumSurcharge" DECIMAL(10,2) NOT NULL,
    "estimatedTotal" DECIMAL(10,2) NOT NULL,
    "quoteCapturedAt" TIMESTAMP(3) NOT NULL,
    "quoteExpiresAt" TIMESTAMP(3) NOT NULL,
    "sampleData" BOOLEAN NOT NULL DEFAULT true,
    "substitutionReview" JSONB NOT NULL,
    "basketSnapshot" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RetailOrder_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RetailOrder_userId_createdAt_idx" ON "RetailOrder"("userId", "createdAt");
CREATE INDEX "RetailOrder_retailerId_idx" ON "RetailOrder"("retailerId");
ALTER TABLE "RetailOrder" ADD CONSTRAINT "RetailOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RetailOrder" ADD CONSTRAINT "RetailOrder_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
