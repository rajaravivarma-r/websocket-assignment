const {
  Worker,
  parentPort,
  workerData,
  isMainThread
} = require("worker_threads");

class Calculator {
  constructor({ incomingPort }) {
    this.startPerforming = this.startPerforming.bind(this);
    this.accumulate = this.accumulate.bind(this);
    this.closeOhlcData = this.closeOhlcData.bind(this);
    this.store = this.store.bind(this);

    this.barNum = 1;
    this.accumulatedData = new Map();
    incomingPort.on("message", this.startPerforming);
  }

  startPerforming(stockDataJson) {
    stockDataJson = stockDataJson.trim();
    const stockData = JSON.parse(stockDataJson);
    const time = new Date(Number(stockData.TS2.toString().slice(0, 13)));
    const stockName = stockData.sym;
    const price = stockData.P;
    const quantityTraded = stockData.Q;

    const ohlcData = this.accumulate(
      { stockName, price, quantityTraded, time },
      15
    );
    if (ohlcData) {
      this.store(ohlcData);
    }
  }

  accumulate({ stockName, price, quantityTraded, time }, seconds) {
    this.sampleStartedAt = this.sampleStartedAt || time;

    const timeDifference = Math.floor(
      (time.getTime() - this.sampleStartedAt.getTime()) / 1000
    );

    if (this.accumulatedData.get(stockName)) {
      const ohlcHistory = this.accumulatedData.get(stockName);
      const lastTrade = ohlcHistory[ohlcHistory.length - 1];
      if (lastTrade) {
        const newHigh = Math.max(lastTrade.high, price);
        const newLow = Math.min(lastTrade.low, price);
        const newVolume = lastTrade.volume + quantityTraded;
        let stockData = this.accumulatedData.get(stockName);
        stockData.push({
          stockName,
          open: lastTrade.open,
          high: newHigh,
          low: newLow,
          close: 0.0,
          barNum: this.barNum,
          volume: newVolume
        });
      }
    } else {
      this.accumulatedData.set(stockName, [
        {
          stockName,
          open: price,
          high: price,
          low: price,
          close: 0.0,
          barNum: this.barNum,
          volume: quantityTraded
        }
      ]);
    }

    if (timeDifference > seconds) {
      const ohlcHistory = this.accumulatedData.get(stockName);

      const accumulatedData = this.accumulatedData;
      this.closeOhlcData(price);
      this.sampleStartedAt = null;
      this.accumulatedData = new Map();
      this.barNum = this.barNum + 1;

      return accumulatedData;
    } else {
      return null;
    }
  }

  closeOhlcData(closingPrice) {
    for (let [stockName, ohlcHistory] of this.accumulatedData) {
      let ohlcData = ohlcHistory[ohlcHistory.length - 1];
      ohlcData.close = closingPrice;
    }
  }

  store(ohlcData) {
    parentPort.postMessage(ohlcData);
  }

  static create({
    onData = data => console.log(data),
    onError = e => console.log("Error: ", e),
    onDone = code => console.log("Done"),
    incomingPort
  } = {}) {
    const worker = new Worker(__filename);
    worker.postMessage({ incomingPort }, [incomingPort]);
    worker.on("message", onData);
    worker.on("error", onError);
    worker.on("exit", onDone);
  }
}

if (!isMainThread) {
  parentPort.on("message", ({ incomingPort }) => {
    let calculator = new Calculator({ incomingPort });
  });
}

module.exports.Calculator = Calculator;
