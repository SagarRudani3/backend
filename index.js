require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Agenda = require('agenda');
const nodemailer = require('nodemailer');
const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Agenda
const agenda = new Agenda({ db: { address: process.env.MONGODB_URI } });

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Make agenda and transporter available throughout the app
app.locals.agenda = agenda;
app.locals.transporter = transporter;

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

// Define Agenda job
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
    console.error('Error sending email:', error);
    throw error;
  }
});

// Start Agenda
(async function() {
  await agenda.start();
  console.log('Agenda started');
})();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes