const express = require('express');
const { body, validationResult } = require('express-validator');
const Email = require('../models/Email');

const router = express.Router();

router.post('/schedule',
  // auth,
  [
    body('to').isEmail(),
    body('subject').notEmpty(),
    body('body').notEmpty(),
    body('sendAt').optional().isISO8601(),
    body('additionalData').optional().isArray()
  ],
  async (req, res) => {
    console.log("%c Line:17 🌮 req", "color:#b03734", req);
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { to, subject, body, sendAt, additionalData } = req.body;
      const agenda = req.app.locals.agenda;

      const scheduledTime = sendAt ? new Date(sendAt) : new Date(Date.now() + 60 * 60 * 1000);

      const email = new Email({
        to,
        subject,
        body,
        sendAt: scheduledTime,
        additionalData: additionalData || [] 
      });
      await email.save();

      await agenda.schedule(scheduledTime, 'send email', {
        to,
        subject,
        body,
        emailId: email._id
      });

      res.json({
        message: 'Email scheduled successfully',
        scheduledFor: scheduledTime,
        emailId: email._id
      });
    } catch (error) {
      console.error('Error scheduling email:', error);
      res.status(500).json({ message: 'Error scheduling email' });
    }
  }
);

router.get('/scheduled',  async (req, res) => {
  try {
    const emails = await Email.find().sort({ sendAt: 1 });
    res.json(emails);
  } catch (error) {
    console.error('Error fetching scheduled emails:', error);
    res.status(500).json({ message: 'Error fetching scheduled emails' });
  }
});

module.exports = router;