-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contractNo" TEXT NOT NULL,
    "signDate" TEXT NOT NULL,
    "partyBName" TEXT NOT NULL,
    "partyBIdCard" TEXT NOT NULL,
    "partyBPhone" TEXT NOT NULL,
    "partyBBankCard" TEXT,
    "plantingArea" REAL NOT NULL,
    "purchaseQuantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "deposit" REAL NOT NULL DEFAULT 0,
    "boxQuantity" INTEGER NOT NULL DEFAULT 0,
    "purchaseManager" TEXT,
    "contractImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "inbound_deliveries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "inbound_products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deliveryId" INTEGER NOT NULL,
    "contractName" TEXT NOT NULL,
    "productLevel" TEXT NOT NULL DEFAULT '统货',
    "quantity" INTEGER NOT NULL,
    "netWeight" REAL NOT NULL,
    "yieldRate" REAL,
    "lossRate" REAL,
    "moistureRate" REAL,
    "unitPrice" REAL NOT NULL,
    "remark" TEXT,
    CONSTRAINT "inbound_products_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "inbound_deliveries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "production_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productionDate" TEXT NOT NULL,
    "batchNo" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "productLevel" TEXT NOT NULL DEFAULT '统货',
    "inputWeight" REAL NOT NULL,
    "outputWeight" REAL NOT NULL,
    "outputQuantity" INTEGER NOT NULL DEFAULT 0,
    "yieldRate" REAL,
    "lossRate" REAL,
    "moistureRate" REAL,
    "operator" TEXT,
    "remark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "sales_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "salesType" TEXT NOT NULL DEFAULT '现货',
    "salesDate" TEXT NOT NULL,
    "salesNo" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerAddress" TEXT,
    "productLevel" TEXT NOT NULL DEFAULT 'Grade1',
    "spec" TEXT,
    "quantity" INTEGER NOT NULL,
    "netWeight" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "paymentMethod" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT '未付款',
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "contractMonth" TEXT,
    "warehouse" TEXT,
    "warehouseCode" TEXT,
    "warrantNo" TEXT,
    "deliveryStatus" TEXT NOT NULL DEFAULT '待交割',
    "settleAmount" REAL NOT NULL DEFAULT 0,
    "salesPerson" TEXT,
    "remark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_contractNo_key" ON "contracts"("contractNo");
