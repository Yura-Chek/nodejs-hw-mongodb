import express from 'express';
import multer from 'multer';

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
import { authenticate } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

// const upload = multer({ dest: 'temp/' });

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
  upload.single('photo'),
  validateBody(validationSchema),
  ctrlWrapper(async (req, res, next) => {
    let photoUrl = null;

    if (req.file) {
      photoUrl = await saveFileToCloudinary(req.file);
    }

    req.body.photo = photoUrl;

    return createContactController(req, res, next);
  }),
);

contactsRouter.patch(
  '/:contactId',
  authenticate,
  isValidId,
  upload.single('photo'),
  validateBody(contactUpdateSchema),
  ctrlWrapper(async (req, res, next) => {
    let photoUrl = null;

    if (req.file) {
      photoUrl = await saveFileToCloudinary(req.file);
      req.body.photo = photoUrl;
    }

    return updateContactController(req, res, next);
  }),
);

contactsRouter.delete(
  '/:contactId',
  authenticate,
  isValidId,
  ctrlWrapper(deleteContactController),
);
