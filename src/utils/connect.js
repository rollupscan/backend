const mongoose = require('mongoose')
const path = require('path')

require('not-index')(path.join(__dirname, '../models'))

module.exports = async function connect() {
  await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017', {
    connectTimeoutMS: 5000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  // Load the models
  console.log('Database connected')
  return () => {
    mongoose.disconnect()
  }
}
