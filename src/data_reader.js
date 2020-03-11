const { Worker, parentPort, workerData } = require("worker_threads");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const events = require("events");

class Reader {
  constructor() {
    this.eventEmitter = new events.EventEmitter();
    this.worker = new Worker(__filename);
    this.reader = readline.createInterface({
      input: fs.createReadStream(
        path.join(__dirname, "..", "data", "trades.json")
      )
    });
    this.reader.on("line", line => {
      this.eventEmitter.emit("dataReceived", line);
    });
    this.on = this.on.bind(this);
  }

  on(eventName, callback) {
    this.eventEmitter.on(eventName, callback);
  }
}
module.exports.Reader = Reader;
