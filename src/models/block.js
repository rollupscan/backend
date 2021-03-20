const mongoose = require('mongoose')

const BlockSchema = new mongoose.Schema(
  {
    rollupId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    parsedData: {
      type: Object,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    isUncle: {
      type: Boolean,
      required: true,
    },
    fraudulent: {
      type: Boolean,
      required: true,
      default: false,
    },
    hash: {
      type: String,
      required: true,
    },
    parentHash: {
      type: String,
      required: false,
    },
    l1Transaction: {
      type: String,
      required: true,
    },
    l1BlockHash: {
      type: String,
      required: true,
    },
    l1BlockNumber: {
      type: Number,
      required: true,
    },
  }
)

BlockSchema.virtual('rollup', {
  ref: 'Rollup',
  localField: 'rollupId',
  foreignField: '_id',
  justOne: true,
})

mongoose.model('Block', BlockSchema)
