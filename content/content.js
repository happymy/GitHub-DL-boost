(async () => {
  const { proxyDomain, enabled } = await chrome.storage.sync.get({
    proxyDomain: 'gh-proxy.com',
    enabled: true,
  });
  if (!enabled) return;

  const proxyUrl = (url) => `https://${proxyDomain}/${url}`;

  const patterns = [
    /^https:\/\/github\.com\/.*\/releases\/download\//,
    /^https:\/\/github\.com\/.*\/archive\//,
    /^https:\/\/raw\.githubusercontent\.com\//,
    /^https:\/\/gist\.githubusercontent\.com\//,
  ];

  function shouldRewrite(href) {
    return patterns.some(p => p.test(href));
  }

  function rewriteLink(a) {
    if (a.dataset.gdbRewritten) return;
    const href = a.getAttribute('href');
    if (!href) return;
    if (shouldRewrite(href)) {
      a.href = proxyUrl(href);
      a.dataset.gdbRewritten = '1';
    }
  }

  document.querySelectorAll('a[href]').forEach(rewriteLink);

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) {
          if (node.tagName === 'A') rewriteLink(node);
          if (node.querySelectorAll) node.querySelectorAll('a[href]').forEach(rewriteLink);
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
