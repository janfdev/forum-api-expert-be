import express from 'express';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import specs from './swagger.js';
import ClientError from '../../Commons/exceptions/ClientError.js';
import DomainErrorTranslator from '../../Commons/exceptions/DomainErrorTranslator.js';
import users from '../../Interfaces/http/api/users/index.js';
import authentications from '../../Interfaces/http/api/authentications/index.js';
import threads from '../../Interfaces/http/api/threads/index.js';
import comments from '../../Interfaces/http/api/comments/index.js';

const createServer = async (container) => {
  const app = express();

  // Swagger Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  // Rate limiting for /threads resource
  const threadsLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 90, // limit each IP to 90 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      res.status(429).json({
        status: 'fail',
        message: 'terlalu banyak permintaan, silakan coba lagi nanti',
      });
    },
  });

  // Middleware for parsing JSON
  app.use(express.json());

  // Register routes
  app.use('/users', users(container));
  app.use('/authentications', authentications(container));
  app.use('/threads', threadsLimiter, threads(container));
  app.use('/threads/:threadId/comments', threadsLimiter, comments(container));

  // Global error handler
  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({
        status: 'fail',
        message: 'request body harus berupa JSON yang valid',
      });
    }

    // bila response tersebut error, tangani sesuai kebutuhan
    const translatedError = DomainErrorTranslator.translate(error);

    // penanganan client error secara internal.
    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }

    // penanganan server error sesuai kebutuhan
    return res.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });

  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      status: 'fail',
      message: 'Route not found',
    });
  });

  return app;
};

export default createServer;
