const { UserInputError } = require('apollo-server')
const bcrypt = require('bcryptjs')

const User = require('../models/user')
const Skill = require('../models/skill')
const Question = require('../models/question')
const Assessment = require('../models/assessment')
const Test = require('../models/test')
const {
  createToken,
  checkAdmin,
  checkLoggedIn,
  calculateScore,
} = require('../utils')
const { QUESTIONS_PER_SKILL } = require('../utils/config')

const Mutation = {
  createUser: (root, { name, email, password, role }) => {
    if (role === 'Admin') {
      throw new UserInputError(
        'You do not have permission to create this user!'
      )
    }

    const user = new User({ name, email, password, role })

    return user.save()
  },

  login: async (root, { email, password }) => {
    const user = await User.findOne({ email }).select('+password').exec()

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UserInputError('wrong credentials')
    }

    const { _id, name, role } = user

    const userForToken = {
      email,
      id: _id,
    }

    return {
      token: createToken(userForToken),
      name,
      email,
      role,
      id: _id,
    }
  },

  createSkill: (root, { name, description }, { currentUser }) => {
    checkAdmin(currentUser)

    const skill = new Skill({ name, description })

    return skill.save()
  },

  createQuestion: (
    root,
    { title, type, options, correctOption, skillId },
    { currentUser }
  ) => {
    checkAdmin(currentUser)

    const question = new Question({
      title,
      type,
      options,
      correctOption,
      skill: skillId,
    })

    return question.save()
  },

  createTest: (root, { name, skills }, { currentUser }) => {
    checkAdmin(currentUser)

    const test = new Test({ name, skills })

    return test.save()
  },

  createAssessment: async (
    root,
    { status, testId, userId, userInput },
    { currentUser }
  ) => {
    checkLoggedIn(currentUser)

    let correct = 0

    for (let res of userInput) {
      let found = await Question.findById(res.questionId)
        .select('correctOption')
        .exec()
      if (found.correctOption === res.answer) correct++
    }

    const assessment = new Assessment({
      score: calculateScore(correct, QUESTIONS_PER_SKILL),
      status,
      test: testId,
      user: userId,
      userInput,
    })

    return assessment.save()
  },

  editTest: async (root, { id, testName, skills }, { currentUser }) => {
    checkAdmin(currentUser)

    try {
      return await Test.findByIdAndUpdate(
        id,
        { $set: { name: testName, skills } },
        {
          new: true,
          runValidators: true,
        }
      )
    } catch (error) {
      throw new UserInputError('Test Not found')
    }
  },

  editAssessment: async (root, { id, status }, { currentUser }) => {
    checkAdmin(currentUser)

    try {
      return await Assessment.findByIdAndUpdate(
        id,
        { $set: { status } },
        {
          new: true,
          runValidators: true,
        }
      )
    } catch (error) {
      throw new UserInputError('Assessment Not found')
    }
  },
}

module.exports = Mutation
