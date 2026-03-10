/*
  Warnings:

  - You are about to drop the column `inputWeight` on the `production_records` table. All the data in the column will be lost.
  - You are about to drop the column `lossRate` on the `production_records` table. All the data in the column will be lost.
  - You are about to drop the column `moistureRate` on the `production_records` table. All the data in the column will be lost.
  - You are about to drop the column `operator` on the `production_records` table. All the data in the column will be lost.
  - You are about to drop the column `outputQuantity` on the `production_records` table. All the data in the column will be lost.
  - You are about to drop the column `outputWeight` on the `production_records` table. All the data in the column will be lost.
  - You are about to drop the column `productLevel` on the `production_records` table. All the data in the column will be lost.
  - You are about to drop the column `productType` on the `production_records` table. All the data in the column will be lost.
  - You are about to drop the column `productionDate` on the `production_records` table. All the data in the column will be lost.
  - You are about to drop the column `yieldRate` on the `production_records` table. All the data in the column will be lost.
  - Added the required column `date` to the `production_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grade` to the `production_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `production_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spec` to the `production_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `production_records` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_production_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "batchNo" TEXT NOT NULL,
    "shift" TEXT NOT NULL DEFAULT 'day',
    "grade" TEXT NOT NULL,
    "spec" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "weight" REAL NOT NULL,
    "remark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_production_records" ("batchNo", "createdAt", "id", "remark", "updatedAt") SELECT "batchNo", "createdAt", "id", "remark", "updatedAt" FROM "production_records";
DROP TABLE "production_records";
ALTER TABLE "new_production_records" RENAME TO "production_records";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
