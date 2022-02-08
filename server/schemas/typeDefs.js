const { gql } = require('apollo-server-express');

const typeDefs = gql`

type User {
    _id: ID
    username: String
    email: String
    friendCount: Int
    thoughts: [Thought]
    friends: [User]
}

type Books {
    _id: ID
    thoughtText: String
    createdAt: String
    username: String
    reactionCount: Int
    reactions: [Reaction]
}

type Reaction {
    _id: ID
    reactionbody: String
    createdAt: String
    username: String
}

type Query {
    me: User  
    users: [User]
    user(username: String!): User   
    books(username: String): [Book]
    book(_id: ID!): Thought
   }

type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    addBook(thoughtText: String!): Thought
    addReaction(thoughtId: ID!,)
}

type Auth {
    token: ID!
    user: User
}
   `;

module.exports = typeDefs;