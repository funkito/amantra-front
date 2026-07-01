ALTER TABLE `Post`
  ADD COLUMN `accessType` ENUM('PUBLIC', 'PAID_WORKSHOP') NOT NULL DEFAULT 'PUBLIC',
  ADD COLUMN `workshopPrice` DOUBLE NULL;

CREATE TABLE `WorkshopAccess` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `postSlug` VARCHAR(255) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `status` ENUM('ACTIVE', 'REVOKED') NOT NULL DEFAULT 'ACTIVE',
  `grantedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `revokedAt` DATETIME(3) NULL,
  `metadata` JSON NULL,
  UNIQUE INDEX `WorkshopAccess_userId_postSlug_key`(`userId`, `postSlug`),
  INDEX `WorkshopAccess_postSlug_status_idx`(`postSlug`, `status`),
  INDEX `WorkshopAccess_orderId_idx`(`orderId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `WorkshopAccess_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `WorkshopAccess_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;