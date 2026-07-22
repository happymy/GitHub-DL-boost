(async () => {
  const { proxyDomain, enabled } = await chrome.storage.sync.get({
    proxyDomain: 'gh-proxy.com',
    enabled: true,
  });
  if (!enabled) return;

  const patterns = [
    /^https:\/\/github\.com\/.*\/releases\/download\//,
    /^https:\/\/github\.com\/.*\/archive\//,
    /^https:\/\/raw\.githubusercontent\.com\//,
    /^https:\/\/gist\.githubusercontent\.com\//,
  ];

  function shouldRewrite(url) {
    return patterns.some(p => p.test(url));
  }

  function rewriteLink(a) {
    if (a.dataset.gdbRewritten) return;
    const url = a.href;
    if (!url) return;
    if (shouldRewrite(url)) {
      a.href = `https://${proxyDomain}/${url}`;
      a.dataset.gdbRewritten = '1';
    }
  }

  function scan() {
    document.querySelectorAll('a[href]').forEach(rewriteLink);
  }

  scan();

  new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) {
          if (node.tagName === 'A') rewriteLink(node);
          else node.querySelectorAll?.('a[href]')?.forEach(rewriteLink);
        }
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
