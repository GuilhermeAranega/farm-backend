import mqtt from "mqtt";
import { prisma } from "../lib/prisma";
import { sendNotification } from "./notifications";
import { broadcastNotification } from "./websocket";
import { checkEnvironmentalAnomalies } from "./environment-warnings";

const client = mqtt.connect("mqtt://localhost:1883");

client.on("connect", () => {
  console.log("✅ conectado ao broker MQTT");
  client.subscribe("sensor/environment");
  client.subscribe("sensor/energy");
  client.subscribe("status/+");
});

client.on("message", async (topic, message) => {
  if (topic.startsWith("status/")) {
    const deviceId = parseInt(topic.split("/")[1]);

    if (!isNaN(deviceId)) {
      const msg = JSON.parse(message.toString());
      const isOnline = msg.status === "true";

      await prisma.device.upsert({
        where: { deviceId },
        update: { status: isOnline, lastUpdate: new Date() },
        create: {
          deviceId,
          status: isOnline,
          lastUpdate: new Date(),
          name: `ESP-${deviceId}`,
        },
      });

      broadcastNotification({
        type: "DEVICE_STATUS",
        message: JSON.stringify({ deviceId, status: msg.status }),
        wsType: "device-status",
      });
    }
    return;
  }

  const payload = JSON.parse(message.toString());

  const now = new Date();
  const readAt = new Date(payload.readAt || now);
  const diffInMinutes =
    Math.abs(now.getTime() - readAt.getTime()) / (1000 * 60);

  if (diffInMinutes > 5) {
    await sendNotification(
      "WARNING",
      `Leitura atrasada em ${Math.round(diffInMinutes)} minutos (${topic})`,
      "NEW_NOTIFICATION"
    );
  }

  if (topic === "sensor/environment") {
    await prisma.environmentalData.create({
      data: {
        soilMoisture: payload.soilMoisture,
        airTemperature: payload.airTemperature,
        airHumidity: payload.airHumidity,
        lightIntensity: payload.lightIntensity,
        timestamp: readAt,
        deviceId: payload.deviceId,
      },
    });
    await checkEnvironmentalAnomalies({
      deviceId: payload.deviceId,
      soilMoisture: payload.soilMoisture,
      airTemperature: payload.airTemperature,
      airHumidity: payload.airHumidity,
      lightIntensity: payload.lightIntensity,
    });
  }

  if (topic === "sensor/energy") {
    await prisma.energyMetric.create({
      data: {
        solarPower: payload.solarPower,
        batteryVoltage: payload.batteryVoltage,
        batteryCharge: payload.batteryCharge,
        timestamp: readAt,
        deviceId: payload.deviceId,
      },
    });
    await checkEnvironmentalAnomalies({
      deviceId: payload.deviceId,
      soilMoisture: payload.soilMoisture,
      airTemperature: payload.airTemperature,
      airHumidity: payload.airHumidity,
      lightIntensity: payload.lightIntensity,
    });
  }
});
