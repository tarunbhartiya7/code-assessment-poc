const mongoose = require('mongoose')
const randomstring = require('randomstring')

const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  testId: String,
  skills: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Skill',
    },
  ],
})

testSchema.pre('save', function (next) {
  this.testId = randomstring.generate(7)
  next()
})

testSchema.pre(/^find/, function (next) {
  this.populate('skills')

  next()
})

module.exports = mongoose.model('Test', testSchema)
