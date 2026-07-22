const STORAGE_KEYS = {
  proxyDomain: 'proxyDomain',
  enabled: 'enabled',
  proxyList: 'proxyList',
};

const DEFAULT_PROXY = 'gh-proxy.com';

const PRESET_PROXIES = [
  'gh-proxy.com',
  'ghfast.top',
  'ghproxy.vip',
  'ghproxy.link',
  'github.moeyy.xyz',
];

const RULE_TEMPLATES = [
  { id: 1,  pattern: '^https://raw\\.githubusercontent\\.com/(.*)',           sub: '/https://raw.githubusercontent.com/$1' },
  { id: 2,  pattern: '^https://github\\.com/(.*)/releases/download/(.*)',      sub: '/https://github.com/$1/releases/download/$2' },
  { id: 3,  pattern: '^https://github\\.com/(.*)/archive/(.*)',               sub: '/https://github.com/$1/archive/$2' },
  { id: 4,  pattern: '^https://gist\\.githubusercontent\\.com/(.*)',           sub: '/https://gist.githubusercontent.com/$1' },
  { id: 5,  pattern: '^https://github\\.com/(.*)/releases/expanded_assets/(.*)', sub: '/https://github.com/$1/releases/expanded_assets/$2' },
  { id: 6,  pattern: '^https://github\\.com/(.*)/releases/tag/(.*)',           sub: '/https://github.com/$1/releases/tag/$2' },
  { id: 7,  pattern: '^https://avatars\\.githubusercontent\\.com/(.*)',         sub: '/https://avatars.githubusercontent.com/$1' },
  { id: 8,  pattern: '^https://api\\.github\\.com/(.*)',                       sub: '/https://api.github.com/$1' },
];

async function buildRules(proxyDomain) {
  return RULE_TEMPLATES.map(t => ({
    id: t.id,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: { regexSubstitution: `https://${proxyDomain}${t.sub}` }
    },
    condition: {
      regexFilter: t.pattern,
      resourceTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'xmlhttprequest', 'image', 'font', 'media', 'websocket', 'other']
    }
  }));
}

async function updateRules(proxyDomain) {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const oldIds = existing.map(r => r.id);
  const rules = await buildRules(proxyDomain);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldIds,
    addRules: rules,
  });
}

async function removeAllRules() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const ids = existing.map(r => r.id);
  if (ids.length) {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ids });
  }
}

async function syncState() {
  const { proxyDomain, enabled } = await chrome.storage.sync.get({
    proxyDomain: DEFAULT_PROXY,
    enabled: true,
  });
  if (enabled) {
    await updateRules(proxyDomain);
  } else {
    await removeAllRules();
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const { proxyList } = await chrome.storage.sync.get({ proxyList: [] });
  if (!proxyList || proxyList.length === 0) {
    await chrome.storage.sync.set({ proxyList: PRESET_PROXIES });
  }
  await syncState();

  chrome.contextMenus.create({
    id: 'copy-accelerated-link',
    title: '复制 GitHub 加速链接',
    contexts: ['link'],
    targetUrlPatterns: [
      '*://github.com/*',
      '*://raw.githubusercontent.com/*',
      '*://gist.github.com/*',
      '*://gist.githubusercontent.com/*',
    ],
  });
  chrome.contextMenus.create({
    id: 'open-accelerated-link',
    title: '打开 GitHub 加速链接',
    contexts: ['link'],
    targetUrlPatterns: [
      '*://github.com/*',
      '*://raw.githubusercontent.com/*',
      '*://gist.github.com/*',
      '*://gist.githubusercontent.com/*',
    ],
  });
});

chrome.runtime.onStartup.addListener(syncState);

chrome.storage.onChanged.addListener((changes) => {
  if (changes.proxyDomain || changes.enabled) {
    syncState();
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const { proxyDomain, enabled } = await chrome.storage.sync.get({
    proxyDomain: DEFAULT_PROXY,
    enabled: true,
  });
  if (!enabled) return;

  const accelerated = `https://${proxyDomain}/${info.linkUrl}`;

  if (info.menuItemId === 'copy-accelerated-link') {
    try {
      await navigator.clipboard.writeText(accelerated);
    } catch {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (text) => navigator.clipboard.writeText(text),
        args: [accelerated],
      });
    }
  }

  if (info.menuItemId === 'open-accelerated-link') {
    chrome.tabs.create({ url: accelerated });
  }
});
