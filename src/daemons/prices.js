const axios = require('axios')
const connect = require('../utils/connect')
const mongoose = require('mongoose')
const ETHPrice = mongoose.model('ETHPrice')

const MAX_DRIFT = 10000

;(async () => {
  const disconnect = await connect()
  const timer = setInterval(async () => {
    const data = (await Promise.all([
      binanceEthPrice(),
      coinbaseEthPrice(),
      krakenEthPrice(),
      binanceUSEthPrice(),
    ])).flat()
    const totalVolume = data.reduce((sum, { volume }) => {
      return sum + +volume
    }, 0)
    console.log(totalVolume)
    const weightedAveragePrice = data.reduce((sum, { price, volume }) => {
      return sum + (+price * +volume/totalVolume)
    }, 0)
    console.log(weightedAveragePrice)
    await ETHPrice.create({
      volume: totalVolume,
      price: weightedAveragePrice,
      timestamp: +new Date(),
      data,
    })
  }, 60000)
  process.on('SIGINT', () => {
    clearInterval(timer)
    disconnect()
  })
})()

// https://github.com/binance-us/binance-official-api-docs/blob/master/rest-api.md#general-api-information
async function binanceUSEthPrice() {
  const { data: { serverTime } } = await axios('https://api.binance.us/api/v3/time')
  console.log(`Binance US drift: ${Math.abs(+serverTime - +new Date())}`)
  if (Math.abs(+serverTime - +new Date()) > MAX_DRIFT) {
    console.log('Binance.us clock out of sync!')
    return []
  }
  const prices = []
  {
    const { data } = await axios('https://api.binance.us/api/v3/ticker/24hr?symbol=ETHUSD')
    prices.push({
      symbol: 'binance.us-USD',
      price: data.lastPrice,
      volume: data.volume,
    })
  }
  {
    const { data } = await axios('https://api.binance.us/api/v3/ticker/24hr?symbol=ETHUSDT')
    prices.push({
      symbol: 'binance.us-USDT',
      price: data.lastPrice,
      volume: data.volume,
    })
  }
  {
    const { data } = await axios('https://api.binance.us/api/v3/ticker/24hr?symbol=ETHBUSD')
    prices.push({
      symbol: 'binance.us-BUSD',
      price: data.lastPrice,
      volume: data.volume,
    })
  }
  return prices
}

// https://binance-docs.github.io/apidocs/spot/en/#current-average-price
async function binanceEthPrice() {
  const { data: { serverTime } } = await axios('https://api.binance.com/api/v3/time')
  console.log(`Binance drift: ${Math.abs(+serverTime - +new Date())}`)
  if (Math.abs(+serverTime - +new Date()) > MAX_DRIFT) {
    console.log('Binance clock out of sync!')
    return []
  }
  const prices = []
  {
    const { data } = await axios('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT')
    prices.push({
      symbol: 'binance-USDT',
      price: data.lastPrice,
      volume: data.volume,
    })
  }
  {
    const { data } = await axios('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDC')
    prices.push({
      symbol: 'binance-USDC',
      price: data.lastPrice,
      volume: data.volume,
    })
  }
  {
    const { data } = await axios('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHTUSD')
    prices.push({
      symbol: 'binance-TUSD',
      price: data.lastPrice,
      volume: data.volume,
    })
  }
  {
    const { data } = await axios('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHBUSD')
    prices.push({
      symbol: 'binance-BUSD',
      price: data.lastPrice,
      volume: data.volume,
    })
  }
  return prices
}

// https://docs.pro.coinbase.com/#get-product-ticker
async function coinbaseEthPrice() {
  const { data: { epoch } } = await axios('https://api.pro.coinbase.com/time')
  console.log(`Coinbase drift: ${Math.abs(+epoch * 1000 - +new Date())}`)
  if (Math.abs(+epoch * 1000 - +new Date()) > MAX_DRIFT) {
    console.log('Coinbase clock out of sync!')
    return []
  }
  const prices = []
  {
    const { data } = await axios('https://api.pro.coinbase.com/products/ETH-USD/ticker')
    prices.push({
      symbol: 'coinbase-USD',
      price: data.price,
      volume: data.volume,
    })
  }
  {
    const { data } = await axios('https://api.pro.coinbase.com/products/ETH-USDC/ticker')
    prices.push({
      symbol: 'coinbase-USDC',
      price: data.price,
      volume: data.volume,
    })
  }
  return prices
}

// https://www.kraken.com/features/api#public-market-data
async function krakenEthPrice() {
  const { data: { result: { unixtime } } } = await axios('https://api.kraken.com/0/public/Time')
  console.log(`Kraken drift: ${Math.abs(+unixtime * 1000 - +new Date())}`)
  if (Math.abs(+unixtime * 1000 - +new Date()) > MAX_DRIFT) {
    console.log('Kraken clock out of sync!')
    return []
  }
  const { data } = await axios('https://api.kraken.com/0/public/Ticker?pair=ethusd,ethusdt,ethusdc')
  const prices = []
  {
    const { v: [,volume], c: [price] } = data.result['ETHUSDC']
    prices.push({
      symbol: 'kraken-USDC',
      price,
      volume,
    })
  }
  {
    const { v: [,volume], c: [price] } = data.result['ETHUSDT']
    prices.push({
      symbol: 'kraken-USDT',
      price,
      volume,
    })
  }
  {
    const { v: [,volume], c: [price] } = data.result['XETHZUSD']
    prices.push({
      symbol: 'kraken-USD',
      price,
      volume,
    })
  }
  return prices
}
