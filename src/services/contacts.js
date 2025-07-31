import { ContactsCollection } from '../models/contact.js';

export const getAllContacts = async (userId) => {
  const contacts = await ContactsCollection.find({ userId });
  return contacts;
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
