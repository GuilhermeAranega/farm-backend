import aedes from "aedes";
import { createServer } from "net";

const broker = new aedes();
const server = createServer(broker.handle);

const PORT = 1883;

server.listen(PORT, () => {
  console.log("mqtt broker running on port " + PORT);
});

export default broker;
