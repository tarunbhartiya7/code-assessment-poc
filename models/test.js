const mongoose = require('mongoose')
const randomstring = require('randomstring')

const { QUESTIONS_PER_SKILL } = require('../utils/config')

const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    unique: true,
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
  this.populate('skills').populate({
    path: 'skills',
    populate: {
      path: 'questions',
      perDocumentLimit: QUESTIONS_PER_SKILL,
    },
  })

  next()
})

module.exports = mongoose.model('Test', testSchema)
