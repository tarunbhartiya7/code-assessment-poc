const mongoose = require('mongoose')

const { QUESTIONS_PER_SKILL } = require('../utils/config')

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    unique: true,
  },
  description: {
    type: String,
  },
})

skillSchema.virtual('questions', {
  ref: 'Question',
  foreignField: 'skill',
  localField: '_id',
})

skillSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'questions',
    perDocumentLimit: QUESTIONS_PER_SKILL,
  })

  next()
})

module.exports = mongoose.model('Skill', skillSchema)
