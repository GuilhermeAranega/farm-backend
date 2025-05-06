import mqtt from "mqtt";

const client = mqtt.connect("mqtt://localhost:1883");

client.on("connect", () => {
  console.log("📡 simulação conectada ao broker");

  // Simula dado de sensor ambiental com atraso de 15 minutos
  const environmentData = {
    soilMoisture: 62,
    airTemperature: 24.8,
    airHumidity: 59.2,
    lightIntensity: 1180.0,
    readAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutos atrás
  };

  // Simula dado de energia atual
  const energyData = {
    solarPower: 5.3,
    batteryVoltage: 3.8,
    batteryCharge: 87,
    readAt: new Date().toISOString(),
  };

  client.publish("sensor/environment", JSON.stringify(environmentData));
  client.publish("sensor/energy", JSON.stringify(energyData));

  console.log("📤 dados publicados");
  setTimeout(() => client.end(), 2000);
});
