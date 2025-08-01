import express from 'express';
import {
  getContactsController,
  getContactByIdController,
  createContactController,
  updateContactController,
  deleteContactController,
} from '../controllers/contacts.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import {
  validationSchema,
  contactUpdateSchema,
} from '../validation/contacts.js';
import { authenticate } from '../middlewares/auth.js'; // <-- додано

export const contactsRouter = express.Router();

contactsRouter.get('/', authenticate, ctrlWrapper(getContactsController));

contactsRouter.get(
  '/:contactId',
  authenticate,
  isValidId,
  ctrlWrapper(getContactByIdController),
);

contactsRouter.post(
  '/',
  authenticate,
  validateBody(validationSchema),
  ctrlWrapper(createContactController),
);

contactsRouter.patch(
  '/:contactId',
  authenticate,
  isValidId,
  validateBody(contactUpdateSchema),
  ctrlWrapper(updateContactController),
);

contactsRouter.delete(
  '/:contactId',
  authenticate,
  isValidId,
  ctrlWrapper(deleteContactController),
);
