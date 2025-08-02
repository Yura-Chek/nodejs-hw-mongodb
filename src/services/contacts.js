import { ContactsCollection } from '../models/contact.js';

export const getAllContacts = async ({
  userId,
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = 1,
}) => {
  const currentPage = Number(page);
  const itemsPerPage = Number(perPage);
  const skip = (currentPage - 1) * itemsPerPage;

  const contactsPromise = ContactsCollection.find({ userId })
    .sort({ [sortBy]: sortOrder === 'desc' || sortOrder === -1 ? -1 : 1 }) // врахувати тип sortOrder
    .skip(skip)
    .limit(itemsPerPage);

  const totalItemsPromise = ContactsCollection.countDocuments({ userId });

  const [contacts, totalItems] = await Promise.all([
    contactsPromise,
    totalItemsPromise,
  ]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    contacts,
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
  };
};

export const getContactById = async (contactId, userId) => {
  const contact = await ContactsCollection.findOne({ _id: contactId, userId });
  return contact;
};

export const createContact = async (contactData, userId) => {
  const contact = new ContactsCollection({ ...contactData, userId });
  return await contact.save();
};

export const updateContact = async (contactId, updateData, userId) => {
  const updatedContact = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    updateData,
    { new: true },
  );
  return updatedContact;
};

export const deleteContact = async (contactId, userId) => {
  const deleted = await ContactsCollection.findOneAndDelete({
    _id: contactId,
    userId,
  });
  return deleted;
};
