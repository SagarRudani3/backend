require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Agenda = require('agenda');
const nodemailer = require('nodemailer');
const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const agenda = new Agenda({ db: { address: process.env.MONGODB_URI } });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.locals.agenda = agenda;
app.locals.transporter = transporter;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

agenda.define('send email', async (job) => {
  const { to, subject, body } = job.attrs.data;

  try {
   const sendMail = await transporter.sendMail({
     from: process.env.SMTP_USER,
     to,
     subject,
     html: body
    });
    console.log("%c Line:48 🍔 sendMail", "color:#fca650", sendMail);

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.log("%c Line:50 🍔 error", "color:#ffdd4d", error);
    throw error;
  }
});

(async function() {
  await agenda.start();
  console.log('Agenda started');
})();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 