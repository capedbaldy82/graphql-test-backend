import { ApolloServer, gql } from 'apollo-server';
import fetch from 'node-fetch';

interface Tweet {
  id: string;
  text: string;
  userId: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
}

let tweets: Tweet[] = [
  {
    id: '1',
    text: 'first',
    userId: '1',
  },
  {
    id: '2',
    text: 'second',
    userId: '2',
  },
];

let users: User[] = [
  {
    id: '1',
    firstName: 'Caped',
    lastName: 'baldy',
    fullName: 'bye',
  },
  {
    id: '2',
    firstName: 'Chang',
    lastName: 'Go',
  },
];

const typeDefs = gql/* javascript */ `
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    """
    Is the sum of firstName + lastName as a string
    """
    fullName: String!
  }
  """
  Tweet object represents a resource for a Tweet
  """
  type Tweet {
    id: ID!
    text: String!
    author: User
  }
  type Query {
    allMovies: [Movie!]!
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    movie(id: String!): Movie
  }
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet!
    """
    Deletes a Tweet if found, else returns false
    """
    deleteTweet(id: ID!): Boolean!
  }
  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String]!
    summary: String
    description_full: String!
    synopsis: String
    yt_trailer_code: String!
    language: String!
    background_image: String!
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
  }
`;

const resolvers = {
  Query: {
    allUsers() {
      return users;
    },
    allTweets() {
      return tweets;
    },
    tweet(root, { id }) {
      return tweets.find((tweet) => tweet.id === id);
    },
    async allMovies(): Promise<any> {
      const data = await fetch('https://yts.mx/api/v2/list_movies.json').then((res) => res.json());

      return data;
    },
    async movie(root, { id }) {
      const data = await fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`).then(
        (res) => res.json()
      );

      return data;
    },
  },
  Mutation: {
    postTweet(root, { text, userId }) {
      const user = users.find((user) => user.id === userId);

      if (!user) return 'no user';

      const newTweet = {
        id: tweets.length + 1 + '',
        text,
        userId,
      };
      tweets.push(newTweet);
      return newTweet;
    },
    deleteTweet(root, { id }) {
      const tweet = tweets.find((tweet) => tweet.id === id);
      if (!tweet) return false;
      tweets = tweets.filter((tweet) => tweet.id !== id);
      return true;
    },
  },
  User: {
    fullName({ firstName, lastName }) {
      return `${firstName} ${lastName}`;
    },
  },
  Tweet: {
    author({ userId }) {
      const user = users.find((user) => user.id === userId);

      return user;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});
