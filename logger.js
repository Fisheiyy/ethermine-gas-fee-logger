import {Builder, By, Key, until} from 'selenium-webdriver'
import fs from "fs-extra"
import fetch from "node-fetch"
const wait = ms => new Promise((resolve, reject) => setTimeout(resolve, ms))
var highlogged = 0
var lowlogged = 0
var currentFee = 0
var lowestFee = 100
var lowestFeeTime = 1E9
var priceArray = []
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
  priceArray.push(price)
  if (price <= lowestFee) {
    lowestFee = Math.min(...priceArray)
    lowestFeeTime = new Date().toLocaleTimeString('en-US')
    if (price <= 8) {
      console.log("Paying out Ethereum")
      payout()
    }
  }
  var timeNow = new Date()
  currentFee = price
  if (price > 8) {
    fs.appendFileSync("gasPrice.txt", "$" + price + " | " + timeNow + "\r\n")
    console.log(`Gas Price Logged at $${price}`)
    highlogged++
  }
  if (price <= 8) {
    fs.appendFileSync("lowGasPrice.txt","$" + price + " | " + timeNow + "\r\n")
    console.log(`Gas Price is $${price} at ${timeNow}`)
    lowlogged++
  } else {return}
}

async function payout() {
  let driver = await new Builder().forBrowser('chrome').build()
  await driver.get('https://ethermine.org/miners/Cc1EF5F989437Ba14A1C239989bD96B9fc5e3969/dashboard')
  var ipAddressRaw = await fetch('https://api.ipify.org/?format=json')
  var ipAddressJSON = await ipAddressRaw.json()
  var ipAddress = ipAddressJSON.ip
  await wait(2000)
  var payoutMenu = await driver.findElement(By.xpath('/html/body/div/div/div[4]/main/div/div[2]/div/div[2]/div[1]/div[2]/div[2]/div[1]/div/button'))
  await payoutMenu.click()
  var ipBox = await driver.findElement(By.xpath('/html/body/div[2]/div/form/div[1]/input'))
  await ipBox.sendKeys(ipAddress)
  var confirmPayout = await driver.findElement(By.xpath('/html/body/div[2]/div/form/input'))
  await confirmPayout.click()
}

(async function loop() {
  var i = 0
  while (true) {
    await gasFee()
    i++
    process.title = `Ethermine Gas Fee Logger | High Fees: ${highlogged} | Low Fees: ${lowlogged} | Current Fee: $${currentFee} | Lowest Fee: $${lowestFee} at ${lowestFeeTime}`
    await wait(25000)
    if (i == 4) {
      console.clear()
      i = 0
    }
    else {console.log("------------------")}
  }
})()