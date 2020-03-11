const path = require("path");
const { Reader } = require("./data_reader.js");

console.log(Reader);
const reader = new Reader();
reader.on("dataReceived", data => {
  console.log("data received", data);
});
