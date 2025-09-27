const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { typeDefs, resolvers } = require('./schema');
const { dataHelpers } = require('./data');

async function startServer() {
  const app = express();

  // Enhanced CORS configuration
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4000', 
      'http://127.0.0.1:3000',
      'http://127.0.0.1:4000',
      'http://localhost:5500',
      'http://127.0.0.1:5500'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Add explicit preflight handling
  app.options('*', cors());

  // Add request logging for debugging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Serve static files (frontend)
  app.use(express.static(path.join(__dirname, 'public')));

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Get token from request headers
      let token = req.headers.authorization;
      
      if (token) {
        // Remove 'Bearer ' prefix if present
        token = token.replace('Bearer ', '');
        
        try {
          // Verify and decode JWT token
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          const user = dataHelpers.findUserById(decoded.id);
          
          return { user };
        } catch (error) {
          console.log('Invalid token:', error.message);
          return {};
        }
      }
      
      return {};
    },
    // Enable GraphQL Playground in development
    introspection: true,
    playground: true,
    // Add CORS to GraphQL
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:4000', 
        'http://127.0.0.1:3000',
        'http://127.0.0.1:4000',
        'http://localhost:5500',
        'http://127.0.0.1:5500'
      ],
      credentials: true
    }
  });

  await server.start();

  // Apply Apollo GraphQL middleware
  server.applyMiddleware({ 
    app, 
    path: '/graphql',
    cors: false // We handle CORS above
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      graphql: '/graphql',
      port: process.env.PORT || 4000
    });
  });

  // Test endpoint for debugging
  app.get('/test', (req, res) => {
    res.json({
      message: 'Server is working!',
      timestamp: new Date().toISOString(),
      headers: req.headers
    });
  });

  // Serve frontend for all other routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
    console.log(`🎮 GraphQL Playground at http://localhost:${PORT}/graphql`);
    console.log(`💡 Frontend at http://localhost:${PORT}`);
    console.log(`🔗 Test endpoint at http://localhost:${PORT}/test`);
    console.log(`❤️  Health check at http://localhost:${PORT}/health`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer().catch(error => {
  console.error('Error starting server:', error);
});

module.exports = { startServer };