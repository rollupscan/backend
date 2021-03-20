const mongoose = require('mongoose')

const RollupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    optimistic: {
      type: Boolean,
      required: true,
    },
  }
)

mongoose.model('Rollup', RollupSchema)
