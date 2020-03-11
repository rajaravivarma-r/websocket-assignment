const path = require("path");
const { Worker, MessageChannel } = require("worker_threads");
const { Calculator } = require("./chart_data_calculator.js");
const { Reader } = require("./data_reader.js");

const { port1, port2 } = new MessageChannel();

Reader.create({ outgoingPort: port2 });
Calculator.create({ incomingPort: port1 });
