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

const createToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })

const verifyToken = (token) => jwt.verify(token, JWT_SECRET)

const MONGODB_URI = DATABASE_URL.replace('<username>', DATABASE_USERNAME)
  .replace('<password>', DATABASE_PASSWORD)
  .replace('<database>', DATABASE_NAME)

module.exports = {
  createToken,
  verifyToken,
  MONGODB_URI,
}
