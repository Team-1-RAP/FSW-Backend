import request from 'supertest';
import express from 'express';
import { getAccountType, getAccountPurposes } from '../src/controllers/AccountController';
import AccountTypes from '../src/models/AccountTypes';
import AccountPurpose from '../src/models/AccountPurpose';
import { sendResponse, sendErrResponse } from '../src/helpers/responseHelper';

// Setup Express app for testing
const app = express();
app.use(express.json());

app.get('/api/account/types', getAccountType);
app.get('/api/account/purposes', getAccountPurposes);

// Mock the modules
jest.mock('../src/models/AccountTypes');
jest.mock('../src/models/AccountPurpose');
jest.mock('../src/helpers/responseHelper');

describe('AccountController', () => {
  // Suppress console.error during tests
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/account/types', () => {
    it('should return 200 and account types if data exists', async () => {
      const mockAccountTypes = [{ id: 1, type: 'Savings' }];
      AccountTypes.findAll.mockResolvedValue(mockAccountTypes);
      sendResponse.mockImplementation((res, status, message, success, data) => res.status(status).json({ message, success, data }));

      const response = await request(app).get('/api/account/types');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Get all account types success',
        success: true,
        data: mockAccountTypes,
      });
    });

    it('should return 404 if no account types found', async () => {
      AccountTypes.findAll.mockResolvedValue([]);
      sendResponse.mockImplementation((res, status, message, success, data) => res.status(status).json({ message, success, data }));

      const response = await request(app).get('/api/account/types');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'No account types found',
        success: false,
        data: null,
      });
    });

    it('should return 500 if there is an error', async () => {
      AccountTypes.findAll.mockRejectedValue(new Error('Database error'));
      sendErrResponse.mockImplementation((res, status, message, success, error) => res.status(status).json({ message, success, error }));

      const response = await request(app).get('/api/account/types');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Internal Server Error',
        success: false,
        error: { error: 'Database error' },
      });
    });
  });

  describe('GET /api/account/purposes', () => {
    it('should return 200 and account purposes if data exists', async () => {
      const mockAccountPurposes = [{ id: 1, purpose: 'Personal' }];
      AccountPurpose.findAll.mockResolvedValue(mockAccountPurposes);
      sendResponse.mockImplementation((res, status, message, success, data) => res.status(status).json({ message, success, data }));

      const response = await request(app).get('/api/account/purposes');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Get all account purposes success',
        success: true,
        data: mockAccountPurposes,
      });
    });

    it('should return 404 if no account purposes found', async () => {
      AccountPurpose.findAll.mockResolvedValue([]);
      sendResponse.mockImplementation((res, status, message, success, data) => res.status(status).json({ message, success, data }));

      const response = await request(app).get('/api/account/purposes');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'No account purposes found',
        success: false,
        data: null,
      });
    });

    it('should return 500 if there is an error', async () => {
      AccountPurpose.findAll.mockRejectedValue(new Error('Database error'));
      sendErrResponse.mockImplementation((res, status, message, success, error) => res.status(status).json({ message, success, error }));

      const response = await request(app).get('/api/account/purposes');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Internal Server Error',
        success: false,
        error: { error: 'Database error' },
      });
    });
  });
});
