const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },
  role: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User',
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: 4,
    select: false,
  },
})

userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 12)

  next()
})

module.exports = mongoose.model('User', userSchema)
