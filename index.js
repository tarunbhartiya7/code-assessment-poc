const { ApolloServer } = require('apollo-server')
const { readFileSync } = require('fs')

const { Query, Mutation } = require('./resolvers')
const User = require('./models/user')
const config = require('./utils/config')
const { verifyToken, connectToDatabase } = require('./utils')
const { PORT } = config

const typeDefs = readFileSync('./schema.graphql').toString('utf-8')

connectToDatabase()

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query,
    Mutation,
  },
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
