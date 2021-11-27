const {
  ApolloServer,
  UserInputError,
  gql,
  AuthenticationError,
} = require('apollo-server')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const User = require('./models/user')
const Skill = require('./models/skill')
const Question = require('./models/question')
const Assessment = require('./models/assessment')
const Test = require('./models/test')
const config = require('./utils/config')
const { createToken, verifyToken, MONGODB_URI } = require('./utils')
const { PORT } = config

console.log('connecting to', MONGODB_URI)

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: Role
  }

  enum Role {
    Admin
    User
  }

  enum QuestionType {
    MCQ
    Coding
  }

  enum Status {
    Not
    Started
    Completed
  }

  type LoginResult {
    id: ID!
    token: String!
    name: String!
    email: String!
    role: Role!
  }

  type Question {
    id: ID!
    title: String!
    type: QuestionType
    options: [String!]
    correctOption: String
  }

  type Skill {
    id: ID!
    name: String!
    description: String!
    noOfQuestions: Int!
    questions: [Question!]!
  }

  type Test {
    id: ID!
    name: String!
    skills: [Skill!]!
    testId: String!
  }

  type Assessment {
    score: Int!
    status: Status!
  }

  type Query {
    me: User
    getAllAssessments(status: Status, score: Int): [Assessment!]
    getAllTests(testId: String): [Test!]
  }

  type Mutation {
    createUser(
      name: String!
      email: String!
      password: String!
      role: Role
    ): User
    login(email: String!, password: String!): LoginResult
    createSkill(
      name: String!
      description: String!
      noOfQuestions: Int
      questions: [ID!]!
    ): Skill
    createQuestion(
      title: String!
      type: QuestionType
      options: [String!]
      correctOption: String
      skillId: ID!
    ): Question
    createTest(name: String!, skills: [ID!]!): Test
    createAssessment(status: Status!, testId: ID!, userId: ID!): Assessment
  }
`

const resolvers = {
  Query: {
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
  },
  Mutation: {
    createUser: (root, { name, email, password, role }) => {
      if (role === 'Admin') {
        throw new UserInputError(
          'You do not have permission to create this user!'
        )
      }

      const user = new User({ name, email, password, role })

      return user.save().catch((error) => {
        throw new UserInputError(error.message)
      })
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

    createSkill: (
      root,
      { name, description, noOfQuestions, questions },
      { currentUser }
    ) => {
      if (!currentUser) {
        throw new AuthenticationError('Not authenticated')
      }

      if (currentUser.role !== 'Admin') {
        throw new UserInputError('You do not have required permission!')
      }

      const skill = new Skill({ name, description, noOfQuestions, questions })

      skill.save()

      return skill.populate('questions')
    },

    createQuestion: (
      root,
      { title, type, options, correctOption, skillId },
      { currentUser }
    ) => {
      if (!currentUser) {
        throw new AuthenticationError('Not authenticated')
      }

      if (currentUser.role !== 'Admin') {
        throw new UserInputError('You do not have required permission!')
      }

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
      if (!currentUser) {
        throw new AuthenticationError('Not authenticated')
      }

      if (currentUser.role !== 'Admin') {
        throw new UserInputError('You do not have required permission!')
      }

      const test = new Test({ name, skills })

      test.save()

      return test.populate('skills')
    },

    createAssessment: (root, { status, testId, userId }) => {
      // TODO: write logic for calculating score
      const assessment = new Assessment({
        status,
        test: testId,
        user: userId,
        score: 3,
      })

      return assessment.save()
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = verifyToken(auth.substring(7))
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
