const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.post('/schedule',
  [
    body('to').isEmail(),
    body('subject').notEmpty(),
    body('body').notEmpty(),
    body('sendAt').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { to, subject, body, sendAt } = req.body;
      const agenda = req.app.locals.agenda;

      const scheduledTime = sendAt ? new Date(sendAt) : new Date(Date.now() + 60 * 60 * 1000);

      await agenda.schedule(scheduledTime, 'send email', {
        to,
        subject,
        body
      });

      res.json({
        message: 'Email scheduled successfully',
        scheduledFor: scheduledTime
      });
    } catch (error) {
      console.error('Error scheduling email:', error);
      res.status(500).json({ message: 'Error scheduling email' });
    }
  }
);

module.exports = router;