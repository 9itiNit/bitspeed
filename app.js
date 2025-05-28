require('dotenv').config();
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');


const app = express();
app.use(express.json());


const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false
  }
);

const Contact = sequelize.define('Contact', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  phoneNumber: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  linkedId: { type: DataTypes.INTEGER, allowNull: true },
  linkPrecedence: { type: DataTypes.ENUM('primary', 'secondary'), allowNull: false },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  deletedAt: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'Contact',
  timestamps: true,
  paranoid: true
});


app.post('/identify', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'At least one of email or phoneNumber is required' });
    }


    const matchingContacts = await Contact.findAll({
      where: {
        [Sequelize.Op.or]: [
          email ? { email } : null,
          phoneNumber ? { phoneNumber } : null
        ].filter(Boolean),
        deletedAt: null
      },
      order: [['createdAt', 'ASC']]
    });

    let allContacts = [...matchingContacts];


    if (matchingContacts.length > 0) {
      const linkedIds = matchingContacts.flatMap(c => [c.id, c.linkedId]).filter(Boolean);
      const expandedContacts = await Contact.findAll({
        where: {
          [Sequelize.Op.or]: [
            { id: linkedIds },
            { linkedId: linkedIds }
          ],
          deletedAt: null
        },
        order: [['createdAt', 'ASC']]
      });
      allContacts = [...new Set([...allContacts, ...expandedContacts])];
    }


    if (allContacts.length === 0) {
      const newContact = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: 'primary'
      });

      return res.json({
        contact: {
          primaryContactId: newContact.id,
          emails: [email].filter(Boolean),
          phoneNumbers: [phoneNumber].filter(Boolean),
          secondaryContactIds: []
        }
      });
    }

  
    let primaryContact = allContacts.find(c => c.linkPrecedence === 'primary');
    if (!primaryContact) primaryContact = allContacts[0];


    const otherPrimaries = allContacts.filter(c => 
      c.linkPrecedence === 'primary' && c.id !== primaryContact.id
    );
    for (const contact of otherPrimaries) {
      await contact.update({ 
        linkPrecedence: 'secondary', 
        linkedId: primaryContact.id 
      });
    }

    const existingEmails = new Set(allContacts.map(c => c.email).filter(Boolean));
    const existingPhones = new Set(allContacts.map(c => c.phoneNumber).filter(Boolean));
    let newSecondary = null;

    if ((email && !existingEmails.has(email)) || (phoneNumber && !existingPhones.has(phoneNumber))) {
      newSecondary = await Contact.create({
        email: existingEmails.has(email) ? null : email,
        phoneNumber: existingPhones.has(phoneNumber) ? null : phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary'
      });
      allContacts.push(newSecondary);
    }


    const secondaryIds = allContacts
      .filter(c => c.linkPrecedence === 'secondary')
      .map(c => c.id);

    const emails = Array.from(new Set([
      primaryContact.email,
      ...allContacts.map(c => c.email).filter(Boolean)
    ])).filter(Boolean);

    const phoneNumbers = Array.from(new Set([
      primaryContact.phoneNumber,
      ...allContacts.map(c => c.phoneNumber).filter(Boolean)
    ])).filter(Boolean);

    res.json({
      contact: {
        primaryContactId: primaryContact.id,
        emails: emails,
        phoneNumbers: phoneNumbers,
        secondaryContactIds: secondaryIds
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Server
sequelize.sync({ force: true }).then(() => {
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
});
