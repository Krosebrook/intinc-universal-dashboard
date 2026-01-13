/**
 * Blink SDK Mocks
 * Mock implementations for testing
 */

import { vi } from 'vitest';

// Mock user data
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  metadata: {
    role: 'editor',
    displayName: 'Test User',
  },
};

// Mock auth state
export const mockAuthState = {
  user: mockUser,
  session: {
    token: 'mock-token',
    expiresAt: Date.now() + 3600000,
  },
};

// Mock Blink client
export const mockBlink = {
  auth: {
    onAuthStateChanged: vi.fn((callback) => {
      // Simulate authenticated user by default
      callback(mockAuthState);
      return vi.fn(); // Return unsubscribe function
    }),
    signIn: vi.fn().mockResolvedValue(mockAuthState),
    signOut: vi.fn().mockResolvedValue(undefined),
    getCurrentUser: vi.fn().mockReturnValue(mockUser),
  },
  db: {
    dashboards: {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'dashboard-123' }),
      update: vi.fn().mockResolvedValue({ id: 'dashboard-123' }),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    comments: {
      find: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 'comment-123' }),
    },
    workspaces: {
      find: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 'workspace-123' }),
    },
    auditLogs: {
      create: vi.fn().mockResolvedValue({ id: 'log-123' }),
    },
  },
  realtime: {
    subscribe: vi.fn().mockReturnValue({
      unsubscribe: vi.fn(),
    }),
    publish: vi.fn().mockResolvedValue(undefined),
  },
  ai: {
    generateText: vi.fn().mockResolvedValue({
      text: 'Mock AI response',
    }),
  },
};

// Reset all mocks
export function resetBlinkMocks() {
  Object.values(mockBlink.auth).forEach(mock => {
    if (typeof mock === 'function' && 'mockClear' in mock) {
      mock.mockClear();
    }
  });
  Object.values(mockBlink.db).forEach(collection => {
    Object.values(collection).forEach(mock => {
      if (typeof mock === 'function' && 'mockClear' in mock) {
        mock.mockClear();
      }
    });
  });
}
