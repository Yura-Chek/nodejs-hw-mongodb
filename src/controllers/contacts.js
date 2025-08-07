import createError from 'http-errors';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getContactsController = async (req, res) => {
  const { id: userId } = req.user;

  const { page = 1, perPage = 10 } = req.query;
  const { sortBy, sortOrder } = parseSortParams(req.query);

  const { contacts, totalItems, totalPages, currentPage, itemsPerPage } =
    await getAllContacts({
      userId,
      page,
      perPage,
      sortBy,
      sortOrder,
    });

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  res.status(200).json({
    status: 200,
    message: 'Successfully retrieved contacts!',
    data: {
      data: contacts,
      page: currentPage,
      perPage: itemsPerPage,
      totalItems,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    },
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;
  const { id: userId } = req.user;

  const contact = await getContactById(contactId, userId);

  if (!contact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const { name, phoneNumber, email, isFavourite, contactType, photo } =
    req.body;
  const { id: userId } = req.user;

  if (!name || !phoneNumber || !contactType) {
    throw createError(
      400,
      'Missing required fields: name, phoneNumber, or contactType',
    );
  }

  const newContact = await createContact(
    {
      name,
      phoneNumber,
      email,
      isFavourite,
      contactType,
      photo,
    },
    userId,
  );

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
};

export const updateContactController = async (req, res) => {
  const { contactId } = req.params;
  const { id: userId } = req.user;

  const updatedContact = await updateContact(contactId, req.body, userId);

  if (!updatedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updatedContact,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;
  const { id: userId } = req.user;

  const deleted = await deleteContact(contactId, userId);

  if (!deleted) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).send();
};

export const postContact = async (req, res, next) => {
  const photo = req.file;
  let photoUrl;

  if (photo && getEnvVar('ENABLE_CLOUDINARY') === 'true') {
    photoUrl = await saveFileToCloudinary(photo);
  }

  const result = await Contact.create({
    ...req.body,
    userId: req.user._id,
    photo: photoUrl,
  });

  res.status(201).json({
    status: 201,
    message: 'Contact successfully created',
    data: result,
  });
};
