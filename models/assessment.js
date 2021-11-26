const mongoose = require('mongoose')

const assessmentSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: [true, 'Score is required for assessment'],
    min: [1, 'Score must be above 1'],
    max: [5, 'Score must be below 5'],
  },
  status: {
    type: String,
    enum: ['Not Started', 'Started', 'Completed'],
    default: 'Not Started',
  },
  test: {
    type: mongoose.Schema.ObjectId,
    ref: 'Test',
    // required: [true, 'Assessment must belong to a Test'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    // required: [true, 'Assessment must belong to a User'],
  },
})

assessmentSchema.pre(/^find/, function (next) {
  this.populate('user')
    .populate('test')
    .populate({
      path: 'test',
      populate: {
        path: 'skills',
      },
    })

  next()
})

module.exports = mongoose.model('Assessment', assessmentSchema)
