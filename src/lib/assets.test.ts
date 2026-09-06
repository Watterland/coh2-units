import { describe, expect, it } from 'vitest';
import { assetUrl } from './assets';

describe('asset URLs', () => {
  it('does not prefix external URLs with the site base path', () => {
    const url = 'https://static.wikia.nocookie.net/companyofheroes/example.png';
    expect(assetUrl(url)).toBe(url);
  });
});
