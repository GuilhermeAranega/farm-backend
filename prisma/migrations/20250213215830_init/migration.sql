-- CreateTable
CREATE TABLE `environmental_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `soil_moisture` INTEGER NOT NULL,
    `air_temperature` DOUBLE NOT NULL,
    `air_humidity` DOUBLE NOT NULL,
    `light_intensity` DOUBLE NOT NULL,
    `avg_soil_moisture` DOUBLE NULL,
    `avg_air_temp` DOUBLE NULL,
    `avg_air_humidity` DOUBLE NULL,
    `avg_light_intensity` DOUBLE NULL,
    `total_entries` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `energy_metrics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `solar_power` DOUBLE NOT NULL,
    `battery_voltage` DOUBLE NOT NULL,
    `battery_charge` INTEGER NOT NULL,
    `avg_solar_power` DOUBLE NULL,
    `avg_battery_voltage` DOUBLE NULL,
    `avg_battery_charge` DOUBLE NULL,
    `total_entries` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `water_pump_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `flow_rate` DOUBLE NOT NULL,
    `environmentalDataId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `water_pump_log` ADD CONSTRAINT `water_pump_log_environmentalDataId_fkey` FOREIGN KEY (`environmentalDataId`) REFERENCES `environmental_data`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
