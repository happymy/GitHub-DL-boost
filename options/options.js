const PRESET_PROXIES = [
  'gh-proxy.com',
  'ghfast.top',
  'ghproxy.vip',
  'ghproxy.link',
  'github.moeyy.xyz',
];

const LS = (id) => document.getElementById(id);

let currentProxies = [];
let currentActive = '';

function showToast(msg) {
  const t = LS('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

async function loadProxies() {
  const { proxyList, proxyDomain } = await chrome.storage.sync.get({
    proxyList: PRESET_PROXIES,
    proxyDomain: 'gh-proxy.com',
  });
  currentProxies = proxyList;
  currentActive = proxyDomain;
  renderList();
}

function renderList() {
  const container = LS('proxyList');
  if (!currentProxies.length) {
    container.innerHTML = '<div class="empty">暂无代理源，请添加</div>';
    return;
  }

  container.innerHTML = currentProxies.map(domain => `
    <div class="proxy-item">
      <div>
        <span class="name">${domain}</span>
        ${domain === currentActive ? '<span class="active-badge">使用中</span>' : ''}
      </div>
      <div class="actions">
        ${domain !== currentActive
          ? `<button class="use-btn" data-domain="${domain}">启用</button>`
          : ''}
        ${!PRESET_PROXIES.includes(domain)
          ? `<button class="del-btn" data-domain="${domain}">删除</button>`
          : ''}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.use-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      currentActive = btn.dataset.domain;
      await chrome.storage.sync.set({ proxyDomain: currentActive });
      showToast(`已切换到 ${currentActive}`);
      renderList();
    });
  });

  container.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const domain = btn.dataset.domain;
      currentProxies = currentProxies.filter(d => d !== domain);
      if (currentActive === domain) {
        currentActive = currentProxies[0] || 'gh-proxy.com';
        if (!currentProxies.includes(currentActive)) {
          currentProxies.push(currentActive);
        }
      }
      await chrome.storage.sync.set({ proxyList: currentProxies, proxyDomain: currentActive });
      showToast(`已删除 ${domain}`);
      renderList();
    });
  });
}

LS('addBtn').addEventListener('click', async () => {
  const input = LS('newProxy');
  const domain = input.value.trim().toLowerCase();
  if (!domain) { showToast('请输入域名'); return; }

  const clean = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  if (!/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/.test(clean)) {
    showToast('请输入有效的域名');
    return;
  }
  if (currentProxies.includes(clean)) {
    showToast('该代理源已存在');
    return;
  }

  currentProxies.push(clean);
  await chrome.storage.sync.set({ proxyList: currentProxies });
  input.value = '';
  showToast(`已添加 ${clean}`);
  renderList();
});

LS('resetLink').addEventListener('click', async (e) => {
  e.preventDefault();
  await chrome.storage.sync.set({
    proxyList: PRESET_PROXIES,
    proxyDomain: 'gh-proxy.com',
    enabled: true,
  });
  currentProxies = [...PRESET_PROXIES];
  currentActive = 'gh-proxy.com';
  showToast('已恢复默认设置');
  renderList();
});

document.addEventListener('DOMContentLoaded', loadProxies);
