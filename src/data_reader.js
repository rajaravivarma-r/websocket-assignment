const {
  Worker,
  parentPort,
  workerData,
  isMainThread
} = require("worker_threads");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

let Reader = {
  readData: function() {
    this.reader = readline.createInterface({
      input: fs.createReadStream(
        path.join(__dirname, "..", "data", "trades.json")
      )
    });
    this.reader.on("line", line => {
      parentPort.postMessage(line);
    });
  },

  create: function({
    onData = data => console.log(data),
    onError = () => console.log("Error"),
    onDone = code => console.log("Done")
  } = {}) {
    const worker = new Worker(__filename);
    worker.on("message", onData);
    worker.on("error", onError);
    worker.on("exit", onDone);
  }
};

if (!isMainThread) {
  Reader.readData();
}
module.exports.Reader = Reader;
