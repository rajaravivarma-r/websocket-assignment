const path = require("path");
const { Reader } = require("./data_reader.js");

Reader.create({ onData: data => console.log("Raja") });
