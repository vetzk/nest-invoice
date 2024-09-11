/*
  Warnings:

  - You are about to alter the column `invoiceStatus` on the `invoice` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `invoice` MODIFY `invoiceStatus` ENUM('PAID', 'UNPAID', 'OVERDUE') NOT NULL;
