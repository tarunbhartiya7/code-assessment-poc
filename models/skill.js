const mongoose = require('mongoose')

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
  this.populate('questions')

  next()
})

module.exports = mongoose.model('Skill', skillSchema)
