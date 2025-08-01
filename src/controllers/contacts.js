import createError from 'http-errors';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';

// Контролер для отримання всіх контактів користувача
export const getContactsController = async (req, res) => {
  const { id: userId } = req.user; // беремо userId як id
  const contacts = await getAllContacts(userId);

  res.status(200).json({
    status: 200,
    message: 'Successfully retrieved contacts!',
    data: contacts,
  });
};

// Контролер для отримання контакту по id
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

// Контролер для створення нового контакту
export const createContactController = async (req, res) => {
  const { name, phoneNumber, email, isFavourite, contactType } = req.body;
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
    },
    userId,
  );

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
};

// Контролер для оновлення контакту
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

// Контролер для видалення контакту
export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;
  const { id: userId } = req.user;

  const deleted = await deleteContact(contactId, userId);

  if (!deleted) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).send();
};
