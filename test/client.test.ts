import { describe, it, expect } from 'vitest';
import { client } from '../src/index';

describe('Lead Docket API Client', () => {
  it('should initialize the client', () => {
    expect(client).toBeDefined();
  });

  it('can be configured', () => {
    client.setConfig({
      baseUrl: 'https://api.example.com',
      headers: {
        Authorization: 'Bearer test-token',
      },
    });

    const config = client.getConfig();
    expect(config.baseUrl).toBe('https://api.example.com');
  });
});
