const swaggerJsdoc = require('swagger-jsdoc');
const { port } = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TapFare API',
      version: '1.0.0',
      description: 'API documentation for TapFare Shared Transport Payment System',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
