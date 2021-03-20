const mongoose = require('mongoose')

const ETHPriceSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
    },
    volume: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  }
)

mongoose.model('ETHPrice', ETHPriceSchema)
