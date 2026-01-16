/**
 * PRD Generator Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PRDGenerator from '../PRDGenerator';
import { blink } from '../../../../lib/blink';

// Mock the blink SDK
vi.mock('../../../../lib/blink', () => ({
  blink: {
    auth: {
      onAuthStateChanged: vi.fn((callback) => {
        callback({ user: { id: 'test-user-123', email: 'test@example.com' }, isLoading: false });
        return () => {};
      }),
    },
    ai: {
      streamText: vi.fn(),
    },
  },
}));

// Mock other dependencies
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../../../lib/rate-limiting/api-limiter', () => ({
  aiRateLimiter: {
    check: vi.fn(() => true),
  },
}));

describe('PRDGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component with input and button', () => {
    render(<PRDGenerator />);
    
    expect(screen.getByText('PRD Generator')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your feature idea/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate PRD/i })).toBeInTheDocument();
  });

  it('should disable generate button when input is empty', () => {
    render(<PRDGenerator />);
    
    const generateButton = screen.getByRole('button', { name: /Generate PRD/i });
    expect(generateButton).toBeDisabled();
  });

  it('should enable generate button when input has text', async () => {
    const user = userEvent.setup();
    render(<PRDGenerator />);
    
    const textarea = screen.getByPlaceholderText(/Enter your feature idea/i);
    await user.type(textarea, 'A new collaboration feature');
    
    const generateButton = screen.getByRole('button', { name: /Generate PRD/i });
    expect(generateButton).not.toBeDisabled();
  });

  it('should show empty state message initially', () => {
    render(<PRDGenerator />);
    
    expect(screen.getByText('No PRD generated yet')).toBeInTheDocument();
    expect(screen.getByText(/Enter a feature idea and click/i)).toBeInTheDocument();
  });

  it('should display copy and download buttons when PRD is generated', async () => {
    const user = userEvent.setup();
    
    // Mock the AI streaming response
    const mockStreamText = vi.mocked(blink.ai.streamText);
    mockStreamText.mockImplementation(async (params, callback) => {
      callback('# Test PRD\n\n## Executive Summary\n\nThis is a test PRD.');
    });
    
    render(<PRDGenerator />);
    
    const textarea = screen.getByPlaceholderText(/Enter your feature idea/i);
    await user.type(textarea, 'Test feature');
    
    const generateButton = screen.getByRole('button', { name: /Generate PRD/i });
    await user.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument();
    });
  });

  it('should call AI service with correct prompt structure', async () => {
    const user = userEvent.setup();
    const mockStreamText = vi.mocked(blink.ai.streamText);
    
    render(<PRDGenerator />);
    
    const textarea = screen.getByPlaceholderText(/Enter your feature idea/i);
    await user.type(textarea, 'Real-time collaboration dashboard');
    
    const generateButton = screen.getByRole('button', { name: /Generate PRD/i });
    await user.click(generateButton);
    
    await waitFor(() => {
      expect(mockStreamText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining('Real-time collaboration dashboard'),
          system: expect.stringContaining('expert technical product manager'),
        }),
        expect.any(Function)
      );
    });
  });
});
