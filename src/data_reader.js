const {
  Worker,
  parentPort,
  workerData,
  isMainThread
} = require("worker_threads");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const events = require("events");

if (isMainThread) {
  const worker = new Worker(__filename);
  worker.on("message", data => console.log("Received message", data));
  worker.on("error", () => console.log("Error"));
  worker.on("exit", code => console.log("Exited", code));
  console.log("Created thread");
} else {
  console.log("Working in thread");
  const reader = readline.createInterface({
    input: fs.createReadStream(
      path.join(__dirname, "..", "data", "trades.json")
    )
  });
  reader.on("line", line => {
    parentPort.postMessage(line);
  });
}

// class Reader {
//   constructor() {
//     if (isMainThread) {
//       this.createThread();
//       console.log("Created thread");
//     } else {
//       console.log("Working in thread");
//       this.reader = readline.createInterface({
//         input: fs.createReadStream(
//           path.join(__dirname, "..", "data", "trades.json")
//         )
//       });
//       this.reader.on("line", line => {
//         parentPort.postMessage(line);
//       });
//     }
//
//     this.createThread = this.createThread.bind(this);
//   }
//
//   createThread() {
//     this.worker = new Worker(__filename);
//     this.worker.on("message", data => console.log("Received message", data));
//     this.worker.on("error", () => console.log("Error"));
//     this.worker.on("exit", code => console.log("Exited", code));
//   }
// }
module.exports.Reader = "Reader";
