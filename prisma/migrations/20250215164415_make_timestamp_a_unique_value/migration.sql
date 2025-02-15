/*
  Warnings:

  - A unique constraint covering the columns `[timestamp]` on the table `energy_metrics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[timestamp]` on the table `environmental_data` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `energy_metrics_timestamp_key` ON `energy_metrics`(`timestamp`);

-- CreateIndex
CREATE UNIQUE INDEX `environmental_data_timestamp_key` ON `environmental_data`(`timestamp`);
