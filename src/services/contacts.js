import { ContactsCollection } from '../models/contact.js';

export const getAllContacts = async () => {
  const students = await ContactsCollection.find();
  return students;
};

export const getContactById = async (contactId) => {
  const student = await ContactsCollection.findById(contactId);
  return student;
};

export const createContact = async (contactData) => {
  const contact = new ContactsCollection(contactData);
  return await contact.save();
};

export const updateContact = async (contactId, updateData) => {
  const updatedContact = await ContactsCollection.findByIdAndUpdate(
    contactId,
    updateData,
    {
      new: true,
    },
  );
  return updatedContact;
};
