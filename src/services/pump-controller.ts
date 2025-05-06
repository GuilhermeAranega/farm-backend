import mqtt from "mqtt";

const client = mqtt.connect("mqtt://localhost:1883");

client.on("connect", () => {
  console.log("✅ Controle da bomba conectado ao broker MQTT");
});

export function turnPumpOn(deviceId: number) {
  client.publish(`pump/control/${deviceId}`, JSON.stringify({ action: "ON" }));
}

export function turnPumpOff(deviceId: number) {
  client.publish(`pump/control/${deviceId}`, JSON.stringify({ action: "OFF" }));
}
