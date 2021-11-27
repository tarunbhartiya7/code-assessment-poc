const { UserInputError, AuthenticationError } = require('apollo-server')

const Assessment = require('../models/assessment')
const Test = require('../models/test')

const Query = {
  me: (root, args, context) => {
    return context.currentUser
  },
  getAllAssessments: (root, { status, score }, { currentUser }) => {
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated')
    }

    if (currentUser.role !== 'Admin') {
      throw new UserInputError('You do not have required permission!')
    }

    if (status) {
      return Assessment.find({ status }).exec()
    }

    if (score) {
      return Assessment.find({ score }).exec()
    }

    return Assessment.find({}).exec()

    // TODO: multiselect filters
    // if (status) {
    //   return Assessment.find({ $or: [status] })
    //     .populate('user')
    //     .populate('test')
    //     .populate({
    //       path: 'test',
    //       populate: {
    //         path: 'skills',
    //       },
    //     })
    //     .exec()
    // }
  },
  getAllTests: (root, { testId }, { currentUser }) => {
    if (!currentUser) {
      throw new AuthenticationError('Not authenticated')
    }

    if (currentUser.role !== 'Admin') {
      throw new UserInputError('You do not have required permission!')
    }

    if (testId) {
      return Test.find({ testId }).exec()
    }

    return Test.find({}).exec()
  },
}

module.exports = Query
