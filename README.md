# Setup
`npm install`

# Run
`node src/main.js`

# Testing
`npx wscat --connect 'localhost:8080'`

## TradeOffs / Enhancements
* The generated OHLC data is not persisted as everything is stored in-memory. Storing all the data will potentially swap RAM content. As a result, only the new data will be delivered to the users.
* Models could be extracted to handle domain logic, which will also make testing easier.
