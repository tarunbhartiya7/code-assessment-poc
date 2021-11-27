const Assessment = require('../models/assessment')
const Test = require('../models/test')
const Skill = require('../models/skill')
const { checkAuthorized } = require('../utils')

const Query = {
  me: (root, args, context) => {
    return context.currentUser
  },
  getAllAssessments: (root, { status, score }, { currentUser }) => {
    checkAuthorized(currentUser)

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
    checkAuthorized(currentUser)

    if (testId) {
      return Test.find({ testId }).exec()
    }

    return Test.find({}).exec()
  },

  getAllSkills: (root, { skillId }, { currentUser }) => {
    checkAuthorized(currentUser)

    if (skillId) {
      return Skill.find({ skillId }).exec()
    }

    return Skill.find({}).exec()
  },
}

module.exports = Query
