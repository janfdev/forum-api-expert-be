import { afterEach, vi } from 'vitest';
import dotenv from 'dotenv';

describe('config module', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('should load default dotenv config when NODE_ENV is not test', async () => {
    // Arrange
    process.env.NODE_ENV = 'development';
    const spyConfig = vi.spyOn(dotenv, 'config');

    // Action
    vi.resetModules();
    await import('../config.js');

    // Assert
    expect(spyConfig).toHaveBeenCalled();
  });
});
