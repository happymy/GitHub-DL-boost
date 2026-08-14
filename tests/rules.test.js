import { describe, it, expect } from 'vitest';

const RULE_TEMPLATES = [
  { id: 1, pattern: '^https://raw\\.githubusercontent\\.com/(.*)',         sub: '/https://raw.githubusercontent.com/\\1' },
  { id: 2, pattern: '^https://github\\.com/(.*)/releases/download/(.*)',    sub: '/https://github.com/\\1/releases/download/\\2' },
  { id: 3, pattern: '^https://github\\.com/(.*)/archive/(.*)',             sub: '/https://github.com/\\1/archive/\\2' },
  { id: 4, pattern: '^https://gist\\.githubusercontent\\.com/(.*)',         sub: '/https://gist.githubusercontent.com/\\1' },
];

function buildRules(proxyDomain) {
  return RULE_TEMPLATES.map(t => ({
    id: t.id,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: { regexSubstitution: `https://${proxyDomain}${t.sub}` }
    },
    condition: {
      regexFilter: t.pattern,
      resourceTypes: ['main_frame']
    }
  }));
}

describe('DNR rule building', () => {
  it('builds 4 rules', () => {
    const rules = buildRules('gh-proxy.com');
    expect(rules).toHaveLength(4);
  });

  it('only intercepts main_frame navigation, not page resources', () => {
    const rules = buildRules('gh-proxy.com');
    for (const rule of rules) {
      expect(rule.condition.resourceTypes).toEqual(['main_frame']);
    }
  });

  it('generates correct regexSubstitution for raw', () => {
    const rules = buildRules('gh-proxy.com');
    const rawRule = rules.find(r => r.id === 1);
    expect(rawRule.action.redirect.regexSubstitution).toBe('https://gh-proxy.com/https://raw.githubusercontent.com/\\1');
  });

  it('generates correct regexSubstitution for release downloads', () => {
    const rules = buildRules('ghfast.top');
    const releaseRule = rules.find(r => r.id === 2);
    expect(releaseRule.action.redirect.regexSubstitution).toBe('https://ghfast.top/https://github.com/\\1/releases/download/\\2');
  });

  it('generates correct regexSubstitution for archive', () => {
    const rules = buildRules('gh-proxy.com');
    const archiveRule = rules.find(r => r.id === 3);
    expect(archiveRule.action.redirect.regexSubstitution).toBe('https://gh-proxy.com/https://github.com/\\1/archive/\\2');
  });

  it('matches actual URL with regexFilter', () => {
    const url = 'https://github.com/user/repo/releases/download/v1.0/file.zip';
    const rule = buildRules('gh-proxy.com').find(r => r.id === 2);
    const re = new RegExp(rule.condition.regexFilter);
    const match = url.match(re);
    expect(match).not.toBeNull();
    expect(match[1]).toBe('user/repo');
    expect(match[2]).toBe('v1.0/file.zip');
  });

  it('regexFilter matches captured groups correctly', () => {
    const url = 'https://github.com/user/repo/releases/download/v1.0/file.zip';
    const rule = buildRules('gh-proxy.com').find(r => r.id === 2);
    const re = new RegExp(rule.condition.regexFilter);
    const m = url.match(re);
    expect(m[1]).toBe('user/repo');
    expect(m[2]).toBe('v1.0/file.zip');
  });

  it('regexSubstitution template has correct backreferences', () => {
    const rule = buildRules('ghfast.top').find(r => r.id === 2);
    expect(rule.action.redirect.regexSubstitution).toBe('https://ghfast.top/https://github.com/\\1/releases/download/\\2');
  });

  it('does not match non-download github.com URLs', () => {
    const urls = [
      'https://github.com/user/repo',
      'https://github.com/user/repo/issues/1',
      'https://github.com/user/repo/pull/2',
      'https://github.com/user/repo/releases/tag/v1.0',
    ];
    for (const template of RULE_TEMPLATES) {
      const re = new RegExp(template.pattern);
      for (const url of urls) {
        expect(url.match(re)).toBeNull();
      }
    }
  });
});
