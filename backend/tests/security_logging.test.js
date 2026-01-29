const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');
const mongoose = require('mongoose');
const util = require('util');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Security Logging Vulnerability', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not log plaintext password during registration', async () => {
    const userData = {
      name: 'Security Test',
      email: 'security@example.com',
      password: 'SuperSecretPassword123!',
      phone: '+1234567890',
      role: 'user'
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData);

    // Better log capture that handles objects
    const logCalls = consoleSpy.mock.calls.map(args => {
      return args.map(arg => {
        if (typeof arg === 'object') {
          return util.inspect(arg, { depth: null, colors: false });
        }
        return String(arg);
      }).join(' ');
    });

    const registrationLog = logCalls.find(log => log.includes('Registration attempt'));

    // Debugging what we actually caught
    if (registrationLog) {
        // We use console.info here which is not mocked or we use process.stdout
        process.stdout.write(`\n[DEBUG] Captured Log: ${registrationLog}\n`);
    } else {
        process.stdout.write('\n[DEBUG] No registration log found!\n');
    }

    expect(registrationLog).toBeDefined();

    // Assert that password is NOT present
    expect(registrationLog).not.toContain(userData.password);
  });
});
