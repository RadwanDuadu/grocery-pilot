CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "ItemPriority" AS ENUM ('ESSENTIAL', 'OPTIONAL');
CREATE TYPE "SubstitutionPolicy" AS ENUM ('ALLOW_SIMILAR', 'EXACT_ONLY', 'NO_SUBSTITUTION');
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'READY', 'EXPIRED', 'SELECTED');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Home',
    "eircode" TEXT NOT NULL,
    "line1" TEXT,
    "city" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroceryList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GroceryList_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroceryListItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "preferredBrand" TEXT,
    "packageDescription" TEXT,
    "catalogueItemId" TEXT,
    "imageKey" TEXT,
    "maxUnitPrice" DECIMAL(10,2),
    "priority" "ItemPriority" NOT NULL DEFAULT 'ESSENTIAL',
    "substitutionPolicy" "SubstitutionPolicy" NOT NULL DEFAULT 'ALLOW_SIMILAR',
    "listId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GroceryListItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Retailer" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Retailer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RetailerProduct" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "packageDescription" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "sampleData" BOOLEAN NOT NULL DEFAULT true,
    "retailerId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RetailerProduct_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BasketQuote" (
    "id" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL,
    "serviceFee" DECIMAL(10,2) NOT NULL,
    "minimumSurcharge" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sampleData" BOOLEAN NOT NULL DEFAULT true,
    "listId" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BasketQuote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BasketQuoteLine" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2),
    "lineTotal" DECIMAL(10,2),
    "matchConfidence" DOUBLE PRECISION,
    "missing" BOOLEAN NOT NULL DEFAULT false,
    "substituted" BOOLEAN NOT NULL DEFAULT false,
    "quoteId" TEXT NOT NULL,
    "listItemId" TEXT NOT NULL,
    "productId" TEXT,
    CONSTRAINT "BasketQuoteLine_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE UNIQUE INDEX "Retailer_slug_key" ON "Retailer"("slug");
CREATE UNIQUE INDEX "RetailerProduct_retailerId_externalId_key" ON "RetailerProduct"("retailerId", "externalId");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroceryList" ADD CONSTRAINT "GroceryList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroceryListItem" ADD CONSTRAINT "GroceryListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "GroceryList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RetailerProduct" ADD CONSTRAINT "RetailerProduct_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BasketQuote" ADD CONSTRAINT "BasketQuote_listId_fkey" FOREIGN KEY ("listId") REFERENCES "GroceryList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BasketQuote" ADD CONSTRAINT "BasketQuote_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BasketQuoteLine" ADD CONSTRAINT "BasketQuoteLine_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "BasketQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BasketQuoteLine" ADD CONSTRAINT "BasketQuoteLine_listItemId_fkey" FOREIGN KEY ("listItemId") REFERENCES "GroceryListItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BasketQuoteLine" ADD CONSTRAINT "BasketQuoteLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "RetailerProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
