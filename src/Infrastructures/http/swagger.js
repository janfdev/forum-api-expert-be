import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Forum API',
      version: '1.0.0',
      description: 'API Documentation for Forum Application',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://namasubdomain.dcdg.xyz',
        description: 'Production server',
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
  },
  apis: ['./src/Interfaces/http/api/**/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export default specs;
