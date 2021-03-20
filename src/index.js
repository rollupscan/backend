const especial = require('especial')
const mongoose = require('mongoose')
const connect = require('./utils/connect')

;(async () => {
  try {
    await connect()
    const app = especial()

    // Setup the routes for rpc
    for (const routes of require('not-index')(path.join(__dirname, 'routes'))) {
      routes(app)
    }

    const port = 4000
    const server = app.listen(port, () => {
      console.log(`Listening on port ${port}`)
    })
  } catch (err) {
    console.log(err)
    console.log('Error starting')
    process.exit(1)
  }
})
