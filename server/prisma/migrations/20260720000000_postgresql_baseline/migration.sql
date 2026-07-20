CREATE EXTENSION IF NOT EXISTS vector;

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "knowledge_documents" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pageCount" INTEGER,
    "errorMessage" TEXT,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "knowledge_chunks" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "page" INTEGER,
    "content" TEXT NOT NULL,
    "charCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "knowledge_chunk_embeddings" (
    "id" SERIAL NOT NULL,
    "chunkId" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "vector" vector NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_chunk_embeddings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contracts" (
    "id" SERIAL NOT NULL,
    "contractNo" TEXT NOT NULL,
    "signDate" TEXT NOT NULL,
    "partyBName" TEXT NOT NULL,
    "partyBIdCard" TEXT NOT NULL,
    "partyBPhone" TEXT NOT NULL,
    "partyBBankCard" TEXT,
    "plantingArea" DOUBLE PRECISION NOT NULL,
    "purchaseQuantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "deposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "boxQuantity" INTEGER NOT NULL DEFAULT 0,
    "purchaseManager" TEXT,
    "contractImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inbound_deliveries" (
    "id" SERIAL NOT NULL,
    "deliveryDate" TEXT NOT NULL,
    "deliveryNo" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "driver" TEXT NOT NULL,
    "driverPhone" TEXT,
    "origin" TEXT NOT NULL,
    "sender" TEXT,
    "senderPhone" TEXT,
    "destination" TEXT NOT NULL,
    "receiver" TEXT,
    "purchaseManager" TEXT,
    "confirmSender" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inbound_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inbound_products" (
    "id" SERIAL NOT NULL,
    "deliveryId" INTEGER NOT NULL,
    "contractName" TEXT NOT NULL,
    "productLevel" TEXT NOT NULL DEFAULT '统货',
    "quantity" INTEGER NOT NULL,
    "netWeight" DOUBLE PRECISION NOT NULL,
    "yieldRate" DOUBLE PRECISION,
    "lossRate" DOUBLE PRECISION,
    "moistureRate" DOUBLE PRECISION,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "remark" TEXT,

    CONSTRAINT "inbound_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "production_records" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "batchNo" TEXT NOT NULL,
    "shift" TEXT NOT NULL DEFAULT 'day',
    "grade" TEXT NOT NULL,
    "spec" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "substandard_products" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "batchNo" TEXT NOT NULL,
    "shift" TEXT NOT NULL DEFAULT 'day',
    "substandardType" TEXT NOT NULL,
    "sourceGrade" TEXT NOT NULL,
    "spec" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "substandard_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sales_records" (
    "id" SERIAL NOT NULL,
    "salesType" TEXT NOT NULL DEFAULT '现货',
    "salesDate" TEXT NOT NULL,
    "salesNo" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerAddress" TEXT,
    "productCategory" TEXT NOT NULL DEFAULT 'normal',
    "productLevel" TEXT NOT NULL DEFAULT 'Grade1',
    "spec" TEXT,
    "quantity" INTEGER NOT NULL,
    "netWeight" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT '未付款',
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contractMonth" TEXT,
    "warehouse" TEXT,
    "warehouseCode" TEXT,
    "warrantNo" TEXT,
    "deliveryStatus" TEXT NOT NULL DEFAULT '待交割',
    "settleAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "salesPerson" TEXT,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

CREATE INDEX "knowledge_documents_ownerId_createdAt_idx" ON "knowledge_documents"("ownerId", "createdAt");

CREATE INDEX "knowledge_chunks_documentId_idx" ON "knowledge_chunks"("documentId");

CREATE UNIQUE INDEX "knowledge_chunks_documentId_chunkIndex_key" ON "knowledge_chunks"("documentId", "chunkIndex");

CREATE INDEX "knowledge_chunk_embeddings_chunkId_idx" ON "knowledge_chunk_embeddings"("chunkId");

CREATE UNIQUE INDEX "contracts_contractNo_key" ON "contracts"("contractNo");

ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "knowledge_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "knowledge_chunk_embeddings" ADD CONSTRAINT "knowledge_chunk_embeddings_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "knowledge_chunks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "inbound_products" ADD CONSTRAINT "inbound_products_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "inbound_deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
