import { vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock Chrome APIs
const mockChrome = {
  runtime: {
    onInstalled: {
      addListener: vi.fn(),
    },
    onMessage: {
      addListener: vi.fn(),
    },
    sendMessage: vi.fn(),
  },
  storage: {
    sync: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
  },
  tabs: {
    query: vi.fn().mockResolvedValue([]),
    sendMessage: vi.fn(),
  },
};

// @ts-expect-error - mocking chrome global
globalThis.chrome = mockChrome;

// Mock fetch for API tests
globalThis.fetch = vi.fn();

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(globalThis, 'sessionStorage', {
  value: sessionStorageMock,
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  sessionStorageMock.getItem.mockReturnValue(null);
});
