import express from 'express';
import {
  getContactsController,
  getContactByIdController,
} from '../controllers/contacts.js';

export const contactsRouter = express.Router();

contactsRouter.get('/', getContactsController);
contactsRouter.get('/:contactId', getContactByIdController);
