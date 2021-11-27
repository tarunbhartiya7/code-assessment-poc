const config = require('./config')
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  DATABASE_URL,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_NAME,
} = config
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const createToken = (id) =>
  jwt.sign(id, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })

const verifyToken = (token) => jwt.verify(token, JWT_SECRET)

const MONGODB_URI = DATABASE_URL.replace('<username>', DATABASE_USERNAME)
  .replace('<password>', DATABASE_PASSWORD)
  .replace('<database>', DATABASE_NAME)

const connectToDatabase = () => {
  console.log('connecting to', MONGODB_URI)

  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('connected to MongoDB')
    })
    .catch((error) => {
      console.log('error connecting to MongoDB:', error.message)
    })
}

module.exports = {
  createToken,
  verifyToken,
  connectToDatabase,
}
