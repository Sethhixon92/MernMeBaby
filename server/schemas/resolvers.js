const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
          if (context.user) {
            const userData = await User.findOne({ _id: context.user._id })
            .select('-__v -password')
            .populate('books')
            .populate('saveBooks');

            return userData;
        }
        throw new AuthenticationError('Not logged in');
    },
        books: async(parent, { username }) => {
            const params = username ? { username } : {};
            return Book.find(params).sort({ createdAt: -1});
        },
        books: async (parent, { _id }) => {
            return Book.findOne({ _id });
        },
        users: async() => {
          return User.find()
          .select('-__v -password')
          .populate('saveBooks')
          .populate('books');
        },
        user: async(parent, { username }) => {
            return User.findOne({ username })
            .select('__v -password')
            .populate('saveBooks')
            .populate('books');
        }
    },
    Mutation: {
        addUser: async(parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user} ;
        },
        login: async(parent, { email, password }) => {
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
        addBook: async (parent, args, context) => {
            if(context.user) {
                const book = await Book.create({ ...args, username: context.user.username });

                await User.findByIdAndUpdate(
                    { _id: context.user_id },
                    { $push: { book: book._id } },
                    { new: true }
                );

                return book;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        addReaction: async (parent, { bookId, reactionBody },context) => {
            if (context.user) {
                const updatedBook = await Book.findOneAndUpdate(
                    {_id: bookID },
                    { $push: { reactions: { reactionBody, username: context.user.username } } },
                    { new: true, runValidators: true }
                );

                return updatedBook;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        saveBooks: async (parent, { saveBooksId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    {_id: context.user.id },
                    { $addToSet: { saveBooks: saveBooksId } },
                    { new: true }
                ).populate('saveBooks');

                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in!');
        }

    }
};

module.exports = resolvers;