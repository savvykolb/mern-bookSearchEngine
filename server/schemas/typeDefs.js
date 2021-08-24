const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email: String
    bookCount: Int
    savedBooks: [Book]
  }
  type Book {
    bookId: ID
    authors: [String]
    createdAt: String
    description: [Description]
    title: String
    image: String
    link: String
  }
  type Description {
    bookId: ID
    authors: [String]
    descriptionBody: String
    title: String
    image: String
    link: String
  }
  type Auth {
    token: ID!
    user: User
  }
  type Query {
    me: User
    users: [User]
    user(username: String!): User
    savedBooks(username: String): [Book]
    book(_id: ID!): Book
  }
  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(bookText: Description!): User
    removeBook(bookId: ID!): User
  }
`;

module.exports = typeDefs;