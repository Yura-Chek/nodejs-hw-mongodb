import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { getEnvVar } from './utils/getEnvVar.js';
import { contactsRouter } from './routers/contacts.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';
import { authRouter } from './routers/auth.js';
import { authenticate } from './middlewares/auth.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = Number(getEnvVar('PORT', '3000'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = YAML.load(
  path.join(__dirname, '..', 'docs', 'openapi.yaml'),
);

export const setupServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  // app.use('/contacts', contactsRouter);
  app.use('/auth', authRouter);
  app.use('/contacts', authenticate, contactsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
  });
};
