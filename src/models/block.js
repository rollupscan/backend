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
    l1TxHash: {
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
    // Store the gas used by the block transaction
    gasConsumed: {
      type: Number,
      required: true,
    },
    // An abstracted transaction count.
    // A more specific breakdown can be calculated at request time on a per-rollup basis.
    transactionCount: {
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
