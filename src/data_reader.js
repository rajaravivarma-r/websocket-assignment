const {
  Worker,
  parentPort,
  workerData,
  isMainThread,
  MessageChannel
} = require("worker_threads");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

let Reader = {
  readData: function(outgoingPort) {
    this.reader = readline.createInterface({
      input: fs.createReadStream(
        path.join(__dirname, "..", "data", "trades.json")
      )
    });
    this.reader.on("line", line => {
      outgoingPort.postMessage(line);
    });
    this.reader.on("close", () => {
      outgoingPort.close();
    });
  },

  create: function({
    onData = data => console.log(data),
    onError = () => console.log("Error"),
    onDone = code => console.log("Done with", code),
    outgoingPort
  } = {}) {
    const worker = new Worker(__filename);
    worker.postMessage({ port: outgoingPort }, [outgoingPort]);
    worker.on("error", onError);
    worker.on("exit", onDone);
  }
};

if (!isMainThread) {
  parentPort.on("message", ({ port }) => {
    Reader.readData(port);
  });
}
module.exports.Reader = Reader;
