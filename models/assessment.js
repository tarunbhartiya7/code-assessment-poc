const mongoose = require('mongoose')

const assessmentSchema = new mongoose.Schema({
  score: {
    type: Number,
    min: [1, 'Score must be above 1'],
    max: [5, 'Score must be below 5'],
  },
  status: {
    type: String,
    enum: ['New', 'Started', 'Completed'],
    default: 'Not Started',
  },
  test: {
    type: mongoose.Schema.ObjectId,
    ref: 'Test',
    required: [true, 'Assessment must belong to a Test'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Assessment must belong to a User'],
  },
  userInput: [
    {
      questionId: mongoose.Schema.ObjectId,
      answer: String,
    },
  ],
})

assessmentSchema.pre(/^find/, function (next) {
  this.populate('user').populate('test')

  next()
})

module.exports = mongoose.model('Assessment', assessmentSchema)
