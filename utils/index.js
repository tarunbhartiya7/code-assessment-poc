const { UserInputError, AuthenticationError } = require('apollo-server')

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

const checkLoggedIn = (user) => {
  if (!user) {
    throw new AuthenticationError('Not authenticated')
  }
}

const checkAdmin = (user) => {
  if (!user) {
    throw new AuthenticationError('Not authenticated')
  }

  if (user.role !== 'Admin') {
    throw new UserInputError('You do not have required permission!')
  }
}

const calculateScore = (correct, noOfQuestions) => {
  const inPercent = (correct * 100) / noOfQuestions
  if (inPercent > 90) return 5
  else if (inPercent > 80) return 4
  else if (inPercent > 60) return 3
  else if (inPercent > 40) return 2
  else return 1
}

module.exports = {
  createToken,
  verifyToken,
  connectToDatabase,
  checkLoggedIn,
  checkAdmin,
  calculateScore,
}
