const path = require("path");
const { Worker, MessageChannel } = require("worker_threads");
const http = require("http");
const websocket = require("websocket");

const { Calculator } = require("./chart_data_calculator.js");
const { Reader } = require("./data_reader.js");

const { port1, port2 } = new MessageChannel();
const calculatorWebThreadPorts = new MessageChannel();
const webIncomingPort = calculatorWebThreadPorts.port1;
const calculatorOutgoingPort = calculatorWebThreadPorts.port2;

Reader.create({ outgoingPort: port2 });
Calculator.create({
  incomingPort: port1,
  outgoingPort: calculatorOutgoingPort
});

const server = http.createServer();
server.listen(8080);

const wsServer = new websocket.server({
  httpServer: server
});

wsServer.on("request", function(request) {
  const connection = request.accept(null, request.origin);
  connection.on("message", function(message) {
    console.log("Received Message:", message.utf8Data);
    connection.sendUTF("Hi this is WebSocket server!");
  });
  connection.on("close", function(reasonCode, description) {
    console.log("Client has disconnected.");
  });

  webIncomingPort.on("message", data => connection.sendUTF(data));
});
