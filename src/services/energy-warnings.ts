import { prisma } from "../lib/prisma";
import { sendNotification } from "./notifications";

export async function checkEnergyAnomalies(payload: {
  deviceId: number;
  solarPower: number;
  batteryVoltage: number;
  batteryCharge: number;
}) {
  const { deviceId, solarPower, batteryVoltage, batteryCharge } = payload;

  const recent = await prisma.energyMetric.findMany({
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

  const avgPower = average("solarPower");
  const avgVoltage = average("batteryVoltage");
  const avgCharge = average("batteryCharge");

  if (solarPower < avgPower * 0.4) {
    await sendNotification(
      "WARNING",
      `Baixa geração solar detectada (${solarPower.toFixed(
        1
      )}W) no dispositivo ${deviceId}`,
      "NEW_NOTIFICATION"
    );
  }

  if (batteryVoltage < avgVoltage * 0.6) {
    await sendNotification(
      "WARNING",
      `Tensão da bateria abaixo do normal (${batteryVoltage.toFixed(
        1
      )}V) no dispositivo ${deviceId}`,
      "NEW_NOTIFICATION"
    );
  }

  if (batteryCharge < 20) {
    await sendNotification(
      "ALERT",
      `Carga crítica de bateria (${batteryCharge}%) no dispositivo ${deviceId}`,
      "NEW_NOTIFICATION"
    );
  }
}
