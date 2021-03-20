const Web3 = require('web3')
const axios = require('axios')
const uuid = require('uuid')
const connect = require('../utils/connect')
const mongoose = require('mongoose')
const Rollup = mongoose.model('Rollup')
const Block = mongoose.model('Block')

// Watch the Zkopru rollup and ingest new blocks as necessary

const ROLLUP_NAME = 'zkopru'
const DESCRIPTION = 'Zero Knowledge Optimistic Privacy Rollup'

// Expecting a websocket connection
const WEB3_URL = process.env.web3 || 'ws://192.168.1.199:9546'
const ZKOPRU_URL = 'https://zkopru.goerli.rollupscan.io/'

;(async () => {
  try {
    await connect()
    // assert the existence of the rollup in the database
    const rollup = await Rollup.findOneAndUpdate({
      name: ROLLUP_NAME,
    }, {
      name: ROLLUP_NAME,
      description: DESCRIPTION,
      optimistic: true,
    }, {
      upsert: true,
      new: true,
    })
    await ingest(rollup)
  } catch (err) {
    console.log(err)
    console.log('Error ingesting data')
  }
})()

// Rollup is a full mongo document including _id
async function ingest(rollup) {
  {
    const [
      latestIngestedBlock,
      latestBlock,
    ] = await Promise.all([
      Block.findOne({
        rollupId: rollup._id,
      }).sort({
        number: 'desc',
      }),
      rpc('l2_blockNumber')
    ])
    if (+latestIngestedBlock < +latestBlock) {
      // start syncing immediately
      await syncBlocks(
        rollup._id,
        latestIngestedBlock ? latestIngestedBlock.number : 0,
        +latestBlock
      )
    }
    console.log(latestIngestedBlock, latestBlock)
  }
  const web3 = new Web3(WEB3_URL)
  let synchronizing = false
  web3.eth.subscribe('newBlockHeaders', async (err, data) => {
    if (err) {
      console.log(err)
      console.log('Subscription error')
      return
    }
    if (synchronizing) return
    try {
      // check the Zkopru node to see if there are new blocks
      const latestIngestedBlock = await Block.findOne({
        rollupId: rollup._id,
      }).sort({
        number: 'desc',
      })
      await syncBlocks(rollup._id, latestIngestedBlock ? latestIngestedBlock.number : 0)
    } catch (_err) {
      console.log(_err)
      console.log('Error syncing')
    } finally {
      synchronizing = false
    }
  })
}

async function syncBlocks(rollupId, start, end) {
  const latestBlock = +(await rpc('l2_blockNumber'))
  for (let x = start; x <= end || latestBlock; x++) {
    // Load the block and include any uncles
    const block = await rpc('l2_getBlockByNumber', [x, true])
    // add the non-uncle block
    const promises = []
    promises.push(saveBlock(rollupId, block))
    // add any uncle blocks
    for (const uncle of block.uncles) {
      promises.push(saveBlock(rollupId, uncle))
    }
    await Promise.all(promises)
  }
}

// Save a Zkopru block
async function saveBlock(rollupId, block) {
  // Load the block hash from the block number
  const web3 = new Web3(WEB3_URL)
  const l1block = await web3.eth.getBlock(+block.proposedAt)
  delete block.uncles
  await Block.create({
    rollupId,
    number: +block.canonicalNum,
    isUncle: !!block.isUncle,
    parsedData: block,
    hash: block.hash,
    parentHash: block.header?.parentBlock,
    l1Transaction: block.proposalTx,
    l1BlockNumber: +block.proposedAt,
    l1BlockHash: l1block.hash,
  })
}

async function rpc(method, params = []) {
  const { data } = await axios.post(ZKOPRU_URL, {
    id: uuid.v4(),
    jsonrpc: '2.0',
    method,
    params,
  })
  return data.result
}
