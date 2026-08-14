const STORAGE_KEYS = {
  proxyDomain: 'proxyDomain',
  enabled: 'enabled',
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
  { id: 1, pattern: '^https://raw\\.githubusercontent\\.com/(.*)',         sub: '/https://raw.githubusercontent.com/\\1' },
  { id: 2, pattern: '^https://github\\.com/(.*)/releases/download/(.*)',    sub: '/https://github.com/\\1/releases/download/\\2' },
  { id: 3, pattern: '^https://github\\.com/(.*)/archive/(.*)',             sub: '/https://github.com/\\1/archive/\\2' },
  { id: 4, pattern: '^https://gist\\.githubusercontent\\.com/(.*)',         sub: '/https://gist.githubusercontent.com/\\1' },
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
      resourceTypes: ['main_frame']
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

async function initState() {
  const { proxyList } = await chrome.storage.sync.get({ proxyList: [] });
  if (!proxyList || proxyList.length === 0) {
    await chrome.storage.sync.set({ proxyList: PRESET_PROXIES });
  }
  await syncState();
}

chrome.runtime.onInstalled.addListener(async () => {
  await initState().catch(console.error);

  chrome.contextMenus.create({
    id: 'copy-accelerated-link',
    title: '复制 GitHub 加速链接',
    contexts: ['link'],
    targetUrlPatterns: [
      '*://github.com/*',
      '*://raw.githubusercontent.com/*',
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
      '*://gist.githubusercontent.com/*',
    ],
  });
});

chrome.runtime.onStartup.addListener(() => syncState().catch(console.error));

chrome.storage.onChanged.addListener((changes) => {
  if (changes.proxyDomain || changes.enabled) {
    syncState().catch(console.error);
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
      if (!tab) return;
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (text) => navigator.clipboard.writeText(text),
        args: [accelerated],
      }).catch(() => {});
    }
  }

  if (info.menuItemId === 'open-accelerated-link') {
    chrome.tabs.create({ url: accelerated });
  }
});
