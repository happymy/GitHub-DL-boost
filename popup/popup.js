const LS = (id) => document.getElementById(id);

LS('openOptions').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

async function loadStatus() {
  const { proxyDomain, enabled } = await chrome.storage.sync.get({
    proxyDomain: 'gh-proxy.com',
    enabled: true,
  });

  LS('currentProxy').textContent = proxyDomain;
  LS('toggle').checked = enabled;
  LS('statusText').textContent = enabled ? '运行中' : '已暂停';
  LS('statusText').style.color = enabled ? '#2e7d32' : '#999';
}

LS('toggle').addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  await chrome.storage.sync.set({ enabled });
});

document.addEventListener('DOMContentLoaded', loadStatus);
