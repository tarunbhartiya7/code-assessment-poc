const mongoose = require('mongoose')
const { ValidationError } = require('apollo-server')

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Question should have a title'],
  },
  type: {
    type: String,
    enum: ['MCQ', 'Coding'],
    default: 'MCQ',
  },
  options: {
    type: [String],
    validate: {
      validator: function (val) {
        if (this.type === 'MCQ') {
          return val.length === 4
        }
      },
      message: 'There are 4 options required for each MCQ!',
    },
  },
  correctOption: {
    type: String,
    select: false,
  },
  skill: {
    type: mongoose.Schema.ObjectId,
    ref: 'Skill',
    required: [true, 'Question must belong to a Skill'],
  },
})

QuestionSchema.pre('save', async function (next) {
  if (this.type === 'MCQ' && !this.correctOption) {
    throw new ValidationError('MCQ Questions should have a correct option')
  }

  next()
})

module.exports = mongoose.model('Question', QuestionSchema)
