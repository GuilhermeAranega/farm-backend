import mqtt from "mqtt";

const client = mqtt.connect("mqtt://localhost:1883");

client.on("connect", () => {
  console.log("✅ Controle da bomba conectado ao broker MQTT");
});

export function changeTime(newTime: string) {
  client.publish(`device/time`, JSON.stringify({ time: newTime }));
}
