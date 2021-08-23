const {ApolloServer, gql, UserInputError} = require('apollo-server')
const {v1: uuid} = require('uuid')
const mongoose = require("mongoose")
const jwt = require('jsonwebtoken')

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const MONGODB_URI = "mongodb+srv://fullstackopen:MRdAYqlAG7WO33ZJ@cluster0.k68jk.mongodb.net/graphql?retryWrites=true&w=majority"
const PASSWORD = 'password'
const SECRET_KEY = 'AGSDGHSDGASGASDGHAGSAHSGASJDHHASGDAHSDG'

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

let authors = [
    {
        name: 'Robert Martin',
        id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
        born: 1952,
    },
    {
        name: 'Martin Fowler',
        id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
        born: 1963
    },
    {
        name: 'Fyodor Dostoevsky',
        id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
        born: 1821
    },
    {
        name: 'Joshua Kerievsky', // birthyear not known
        id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
    },
    {
        name: 'Sandi Metz', // birthyear not known
        id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
    },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's name in the context of the book instead of the author's id
 * However, for simplicity, we will store the author's name in connection with the book
*/

let books = [
    {
        title: 'Clean Code',
        published: 2008,
        author: 'Robert Martin',
        id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring']
    },
    {
        title: 'Agile software development',
        published: 2002,
        author: 'Robert Martin',
        id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
        genres: ['agile', 'patterns', 'design']
    },
    {
        title: 'Refactoring, edition 2',
        published: 2018,
        author: 'Martin Fowler',
        id: "afa5de00-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring']
    },
    {
        title: 'Refactoring to patterns',
        published: 2008,
        author: 'Joshua Kerievsky',
        id: "afa5de01-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring', 'patterns']
    },
    {
        title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
        published: 2012,
        author: 'Sandi Metz',
        id: "afa5de02-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring', 'design']
    },
    {
        title: 'Crime and punishment',
        published: 1866,
        author: 'Fyodor Dostoevsky',
        id: "afa5de03-344d-11e9-a414-719c6709cf3e",
        genres: ['classic', 'crime']
    },
    {
        title: 'The Demon ',
        published: 1872,
        author: 'Fyodor Dostoevsky',
        id: "afa5de04-344d-11e9-a414-719c6709cf3e",
        genres: ['classic', 'revolution']
    },
]

const typeDefs = gql`
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }
  
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }
  
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
}

    type Token {
      value: String!
    }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    recommendations: [Book!]!
    allAuthors: [Author!]!
    me: User
  }
  
  type Mutation {
    addBook(
        title: String!
        published: Int!
        author: String!
        genres: [String!]!
    ): Book
    editAuthor(
        name: String!
        setBornTo: Int!
    ): Author
    createUser(
        username: String!
        favoriteGenre: String!
    ): User
    login(
        username: String!
        password: String!
    ): Token
  }
`

const resolvers = {
    Query: {
        bookCount: async () => Book.collection.countDocuments(),
        authorCount: async () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
            const filter = args.genre ? {genres: args.genre} : {}
            return await Book
                .find(filter)
                .populate('author', {name: 1, born: 1, bookCount: 1})
        },
        allAuthors: async () => await Author.find({}),
        me: async (root, args, context) => await context.currentUser,
        recommendations: async (root, args, context) => {
            const user = await context.currentUser
            return await Book
                .find({genres: user.favoriteGenre})
                .populate('author', {name: 1, born: 1, bookCount: 1}
                )
        },
    },

    Mutation: {
        addBook: async (root, args, context) => {
            const currentUser = await context.currentUser
            if (!currentUser) {
                return new UserInputError("Credentials not provided!")
            }
            const bookObj = {...args}
            let author = await Author.findOne({name: bookObj.author})
            if (author == null) {
                author = new Author({name: bookObj.author})
                await author.save().catch(error => {
                    throw new UserInputError(error.message, {
                        invalidArgs: args,
                    })
                })
            }
            const book = new Book(bookObj)
            book.author = author
            await book.save().catch(error => {
                throw new UserInputError(error.message, {
                    invalidArgs: args,
                })
            })
            return book
        },
        editAuthor: async (root, args) => {
            const currentUser = await context.currentUser
            if (!currentUser) {
                return new UserInputError("Credentials not provided!")
            }
            const author = await Author.findOne({name: args.name})
            if (author) {
                author.born = args.setBornTo
                return author.save().catch(error => {
                    throw new UserInputError(error.message, {
                        invalidArgs: args,
                    })
                })
            } else {
                return null
            }
        },
        createUser: async (root, args) => {
            const user = new User({...args})
            return await user.save().catch(error => {
                throw new UserInputError(error.message, {
                    invalidArgs: args,
                })
            })
        },
        login: async (root, args) => {
            const user = await User.findOne({username: args.username})
            if (!user || args.password !== PASSWORD) {
                throw new UserInputError("Wrong credentials!")
            }

            const userForToken = {
                user: user.username,
                id: user._id
            }
            return {value: jwt.sign(userForToken, SECRET_KEY)}

        }
    },

    Author: {
        bookCount: (root) => Book.find({author: root.id}).countDocuments(),
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({req}) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
            const decodedToken = jwt.verify(
                auth.substring(7), SECRET_KEY
            )
            const currentUser = await User.findById(decodedToken.id)
            return {currentUser}
        }
    }
})

server.listen().then(({url}) => {
    console.log(`Server ready at ${url}`)
})