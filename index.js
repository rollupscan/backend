const especial = require('especial')

const app = especial()

require('./src/rollups')(app)
require('./src/utils')(app)

const port = 4000
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
