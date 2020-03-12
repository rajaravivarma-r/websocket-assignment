const path = require("path");
const { Worker, MessageChannel } = require("worker_threads");
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

webIncomingPort.on("message", data => console.log("From main thread", data));
