const request = require('supertest');
// Mock mongoose to avoid connection errors if models try to use it
jest.mock('mongoose', () => {
  const originalModule = jest.requireActual('mongoose');
  return {
    ...originalModule,
    connect: jest.fn().mockResolvedValue(true),
    model: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(true)
    }),
    Schema: originalModule.Schema
  };
});

// We also need to mock the User model specifically because it's required in auth routes
jest.mock('../models/User', () => {
  return {
    findOne: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockResolvedValue(null),
    // Mock constructor
    prototype: {
      save: jest.fn().mockResolvedValue(true)
    }
  };
});

const app = require('../server');

describe('Security Logging Vulnerability', () => {
  let consoleSpy;
  let consoleOutput = [];

  beforeEach(() => {
    consoleOutput = [];
    consoleSpy = jest.spyOn(console, 'log').mockImplementation((...args) => {
      consoleOutput.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should not log sensitive password in registration attempt', async () => {
    const sensitivePassword = 'SuperSecretPassword123!';
    const userData = {
      name: 'Security Test User',
      email: 'security@example.com',
      password: sensitivePassword,
      phone: '+1234567890'
    };

    try {
      await request(app)
        .post('/api/auth/register')
        .send(userData);
    } catch (e) {
      // Ignore errors, we only care about logs
    }

    const logs = consoleOutput.join('\n');

    // This expectation should FAIL if the vulnerability exists
    expect(logs).not.toContain(sensitivePassword);
  });
});
