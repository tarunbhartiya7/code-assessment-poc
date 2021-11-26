const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const User = require('./models/user')
const config = require('./utils/config')
const { PORT, MONGODB_URI, JWT_SECRET } = config

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
    admin
    user
  }

  type Token {
    value: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    createUser(
      name: String!
      email: String!
      password: String!
      role: Role
    ): User
    login(email: String!, password: String!): Token
  }
`

const resolvers = {
  Query: {
    me: (root, args, context) => {
      return context.currentUser
    },
  },
  Mutation: {
    createUser: (root, { name, email, password, role }) => {
      const user = new User({ name, email, password, role })

      if (role === 'admin') {
        throw new UserInputError(
          'You do not have permission to create this user!'
        )
      }

      return user.save().catch((error) => {
        throw new UserInputError(error.message)
      })
    },
    login: async (root, { email, password }) => {
      const user = await User.findOne({ email }).select('+password').exec()

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UserInputError('wrong credentials')
      }

      const userForToken = {
        email,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
