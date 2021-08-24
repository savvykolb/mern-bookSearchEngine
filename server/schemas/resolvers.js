const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('books')

        return userData;
      }

      throw new AuthenticationError('Not logged in');
    },
    users: async () => {
      return User.find()
        .select('-__v -password')
        .populate('books')
    },
    user: async ({ username }) => {
      return User.findOne({ username })
        .select('-__v -password')
        .populate('books')
    },
    books: async ({ username }) => {
      const params = username ? { username } : {};
      return Book.find(params).sort({ createdAt: -1 });
    },
    book: async ({ _id }) => {
      return Book.findOne({ _id });
    }
  },

  Mutation: {
    addUser: async (args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async ({ email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (args, context) => {
      if (context.user) {
        const book = await Book.create({ ...args, username: context.user.username });

        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: book._id } },
          { new: true }
        );

        return book;
      }

      throw new AuthenticationError('You need to be logged in!');
    },
    removeBook: async ({ bookId }, context) => {
      if (context.user) {
        const updatedBook = await Book.findOneAndUpdate(
          { _id: bookId },
          { $pull: { savedBooks: bookId} },
          { new: true, runValidators: true }
        );

        return updatedBook;
      }

      throw new AuthenticationError('You need to be logged in!');
    }
  }
};

module.exports = resolvers;