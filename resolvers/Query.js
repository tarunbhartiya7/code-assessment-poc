const Assessment = require('../models/assessment')
const Test = require('../models/test')
const Skill = require('../models/skill')
const { checkAdmin, checkLoggedIn } = require('../utils')

const Query = {
  me: (root, args, context) => {
    return context.currentUser
  },
  getAllAssessments: (
    root,
    { status, score, page, limit },
    { currentUser }
  ) => {
    checkAdmin(currentUser)

    if (page && limit) {
      let p = page * 1 || 1
      let l = limit * 1 || 100
      let skip = (p - 1) * l
      return Assessment.find({}).skip(skip).limit(l).exec()
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
    checkLoggedIn(currentUser)

    if (testId) {
      return Test.find({ testId }).exec()
    }

    return Test.find({}).exec()
  },

  getAllSkills: (root, { skillId }, { currentUser }) => {
    checkAdmin(currentUser)

    if (skillId) {
      return Skill.find({ skillId }).exec()
    }

    return Skill.find({}).exec()
  },
}

module.exports = Query
