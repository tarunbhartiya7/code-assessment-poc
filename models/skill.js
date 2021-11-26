const mongoose = require('mongoose')
const { ValidationError } = require('apollo-server')

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  description: {
    type: String,
  },
  noOfQuestions: {
    type: Number,
    default: 15,
  },
})

skillSchema.pre('save', function (next) {
  if (this.noOfQuestions.length !== this.questions.length) {
    throw new ValidationError(
      'Number of questions should be equal to the questions'
    )
  }

  next()
})

skillSchema.virtual('questions', {
  ref: 'Question',
  foreignField: 'skill',
  localField: '_id',
})

module.exports = mongoose.model('Skill', skillSchema)
