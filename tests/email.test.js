const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Email Scheduling API', () => {
  let token;

  beforeAll(async () => {
    const user = await User.create({
      email: 'test@test.com',
      password: 'password123'
    });

    token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET
    );
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/emails/schedule', () => {
    it('should schedule an email successfully', async () => {
      const response = await request(app)
        .post('/api/emails/schedule')
        .set('Authorization', `Bearer ${token}`)
        .send({
          to: 'recipient@example.com',
          subject: 'Test Email',
          body: 'This is a test email'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Email scheduled successfully');
      expect(response.body).toHaveProperty('scheduledFor');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/emails/schedule')
        .send({
          to: 'recipient@example.com',
          subject: 'Test Email',
          body: 'This is a test email'
        });

      expect(response.status).toBe(401);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/emails/schedule')
        .set('Authorization', `Bearer ${token}`)
        .send({
          to: 'invalid-email',
          subject: 'Test Email',
          body: 'This is a test email'
        });

      expect(response.status).toBe(400);
    });
  });
});