import { describe, it, expect } from 'vitest';

const domainRegex = /^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/;

function isValidDomain(domain) {
  const clean = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  return domainRegex.test(clean);
}

describe('domain validation', () => {
  it('accepts simple domains', () => {
    expect(isValidDomain('gh-proxy.com')).toBe(true);
  });

  it('accepts domains with subdomains', () => {
    expect(isValidDomain('sub.example.com')).toBe(true);
  });

  it('accepts domains with hyphens', () => {
    expect(isValidDomain('my-proxy.example.com')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(isValidDomain('')).toBe(false);
  });

  it('rejects strings without dots', () => {
    expect(isValidDomain('localhost')).toBe(false);
  });

  it('strips protocol prefix', () => {
    expect(isValidDomain('https://gh-proxy.com')).toBe(true);
    expect(isValidDomain('http://example.com')).toBe(true);
  });

  it('strips trailing slashes', () => {
    expect(isValidDomain('gh-proxy.com/')).toBe(true);
    expect(isValidDomain('gh-proxy.com///')).toBe(true);
  });

  it('rejects TLD shorter than 2 chars', () => {
    expect(isValidDomain('example.x')).toBe(false);
  });

  it('rejects leading dot', () => {
    expect(isValidDomain('.example.com')).toBe(false);
  });
});
