import { prisma } from "../lib/prisma";
import { sendNotification } from "./notifications";

export async function checkEnvironmentalAnomalies(payload: {
  deviceId: number;
  soilMoisture: number;
  airTemperature: number;
  airHumidity: number;
  lightIntensity: number;
}) {
  const {
    deviceId,
    soilMoisture,
    airTemperature,
    airHumidity,
    lightIntensity,
  } = payload;

  const recent = await prisma.environmentalData.findMany({
    where: { deviceId },
    orderBy: { timestamp: "desc" },
    take: 10,
  });

  if (recent.length < 5) return;

  const average = (key: keyof typeof payload) => {
    return (
      recent.reduce((sum, entry) => sum + (entry[key] as number), 0) /
      recent.length
    );
  };

  const avgSoil = average("soilMoisture");
  const avgTemp = average("airTemperature");
  const avgHumidity = average("airHumidity");
  const avgLight = average("lightIntensity");

  if (soilMoisture > avgSoil * 1.3) {
    await sendNotification(
      "ALERT",
      `Umidade do solo muito alta (${soilMoisture}%) no dispositivo ${deviceId}`,
      "NEW_NOTIFICATION"
    );
  }

  if (soilMoisture < avgSoil * 0.5) {
    await sendNotification(
      "WARNING",
      `Umidade do solo muito baixa (${soilMoisture}%) no dispositivo ${deviceId}`,
      "NEW_NOTIFICATION"
    );
  }

  if (airTemperature > avgTemp * 1.25) {
    await sendNotification(
      "ALERT",
      `Temperatura elevada (${airTemperature.toFixed(
        1
      )}°C) no dispositivo ${deviceId}`,
      "NEW_NOTIFICATION"
    );
  }

  if (airHumidity < avgHumidity * 0.6) {
    await sendNotification(
      "WARNING",
      `Umidade do ar baixa (${airHumidity.toFixed(
        1
      )}%) no dispositivo ${deviceId}`,
      "NEW_NOTIFICATION"
    );
  }

  if (lightIntensity < avgLight * 0.4) {
    await sendNotification(
      "INFO",
      `Luminosidade abaixo do normal (${lightIntensity.toFixed(
        0
      )}) no dispositivo ${deviceId}`,
      "NEW_NOTIFICATION"
    );
  }
}
