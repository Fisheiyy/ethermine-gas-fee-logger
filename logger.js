import fs from "fs-extra"
import fetch from "node-fetch"
const wait = ms => new Promise((resolve, reject) => setTimeout(resolve, ms))
var highlogged = 0
var lowlogged = 0
var currentFee = 0
process.title = `Ethermine Gas Fee Logger`


async function gasFee() {
  console.log("Fetching ETH Price")
  var ethprice = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
  console.log("ETH Price Fetched")
  var ethPriceJSON = await ethprice.json()
  console.log("Fetching Ethermine Gas Amount")
  var etherminegwei = await fetch("https://api.ethermine.org/poolStats")
  console.log("Ethermine Gas Amount Fetched")
  var ethermineGweiJSON = await etherminegwei.json()
  var ethPrice = ethPriceJSON.ethereum.usd
  var ethermineGwei = ethermineGweiJSON.data.estimates.gasPrice
  var gweiPrice = ethPrice / 1000000000
  var price = (ethermineGwei * gweiPrice * 21000).toFixed(2)
  var timeNow = new Date()
  currentFee = price
  if (price > 5) {
    fs.appendFileSync("gasPrice.txt", "$" + price + " | " + timeNow + "\r\n")
    console.log(`Gas Price Logged at $${price}`)
    highlogged++
  }
  if (price <= 5) {
    fs.appendFileSync("lowGasPrice.txt","$" + price + " | " + timeNow + "\r\n")
    console.log(`Gas Price is $${price} at ${timeNow}`)
    lowlogged++
  } else {return}
}

(async function loop() {
  var i = 0
  while (true) {
    await gasFee()
    i++
    process.title = `Ethermine Gas Fee Logger | High Fee Amt: ${highlogged} | Low Fee Amt: ${lowlogged} | Current Fee: $${currentFee}`
    await wait(25000)
    if (i == 4) {
      console.clear()
      i = 0
    }
    else {console.log("------------------")}
  }
})()