import { describe, it, expect } from 'vitest';

const patterns = [
  /^https:\/\/github\.com\/.*\/releases\/download\//,
  /^https:\/\/github\.com\/.*\/archive\//,
  /^https:\/\/raw\.githubusercontent\.com\//,
  /^https:\/\/gist\.githubusercontent\.com\//,
];

function shouldRewrite(url) {
  return patterns.some(p => p.test(url));
}

describe('content script URL matching', () => {
  it('matches release downloads', () => {
    expect(shouldRewrite('https://github.com/user/repo/releases/download/v1.0/asset.zip')).toBe(true);
  });

  it('matches archive downloads', () => {
    expect(shouldRewrite('https://github.com/user/repo/archive/refs/heads/main.zip')).toBe(true);
    expect(shouldRewrite('https://github.com/user/repo/archive/v1.0.tar.gz')).toBe(true);
  });

  it('matches raw.githubusercontent.com', () => {
    expect(shouldRewrite('https://raw.githubusercontent.com/user/repo/main/file.js')).toBe(true);
  });

  it('matches gist.githubusercontent.com', () => {
    expect(shouldRewrite('https://gist.githubusercontent.com/user/abc123/raw/file.js')).toBe(true);
  });

  it('rejects GitHub homepage', () => {
    expect(shouldRewrite('https://github.com/')).toBe(false);
    expect(shouldRewrite('https://github.com/user/repo')).toBe(false);
  });

  it('rejects GitHub issue/PR pages', () => {
    expect(shouldRewrite('https://github.com/user/repo/issues/1')).toBe(false);
    expect(shouldRewrite('https://github.com/user/repo/pull/1')).toBe(false);
  });

  it('rejects GitHub releases page (not download)', () => {
    expect(shouldRewrite('https://github.com/user/repo/releases/tag/v1.0')).toBe(false);
    expect(shouldRewrite('https://github.com/user/repo/releases/expanded_assets/v1.0')).toBe(false);
  });

  it('rejects avatars and API', () => {
    expect(shouldRewrite('https://avatars.githubusercontent.com/u/12345')).toBe(false);
    expect(shouldRewrite('https://api.github.com/repos/user/repo')).toBe(false);
  });

  it('rejects gist.github.com (not gist.githubusercontent.com)', () => {
    expect(shouldRewrite('https://gist.github.com/user/abc123')).toBe(false);
  });

  it('handles relative URLs resolved to absolute via a.href', () => {
    expect(shouldRewrite('https://github.com/user/repo/archive/refs/heads/main.zip')).toBe(true);
  });
});
