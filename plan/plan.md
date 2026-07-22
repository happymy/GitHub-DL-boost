# GitHub-DL-boost

Chrome MV3 扩展，自动将 GitHub Releases / Raw / Archive / Gist 下载链接重定向到用户配置的代理加速站，提升国内下载速度。

## 技术选型
- Manifest V3（Chrome 88+）
- 纯 JavaScript，无框架依赖
- Chrome Extension API（`declarativeNetRequest` / `storage` / `contextMenus` / `scripting` / `activeTab`）

## 项目结构
```
GitHub-DL-boost/
├── manifest.json            # 扩展清单
├── service-worker.js        # 后台 Service Worker（DNR 规则 + 右键菜单）
├── content/
│   └── content.js           # 内容脚本（页面级下载链接重写）
├── popup/
│   ├── popup.html           # 弹出窗口
│   ├── popup.js             # 弹出窗口逻辑
│   └── popup.css            # 弹出窗口样式
├── options/
│   ├── options.html         # 设置页面
│   └── options.js           # 设置逻辑（代理源管理）
├── icons/                   # 图标
├── tests/                   # Vitest 单元测试
├── plan/
│   └── plan.md              # 本文档
├── .gitignore
├── package.json
└── vitest.config.js
```

## 拦截机制（双层）

### 1. Content Script（主要负责）
- 注入 `*://github.com/*` 和 `*://gist.github.com/*`
- 监听 DOM 变化（MutationObserver），即时重写 `<a href>` 为代理 URL
- **`a.href`** 返回绝对 URL，解决 `getAttribute('href')` 返回相对路径的问题

### 2. DNR 规则（兜底）
- 4 条 `declarativeNetRequest` 动态规则
- 匹配直接访问的下载链接（非页面点击）
- 通过 Service Worker 动态更新

## 支持的 URL 模式
- `raw.githubusercontent.com/*` — Raw 文件
- `github.com/*/releases/download/*` — Release 附件
- `github.com/*/archive/*` — 代码打包 ZIP/TAR.GZ
- `gist.githubusercontent.com/*` — Gist 文件

## 屏蔽的 URL（不重写）
- `github.com/*/releases/tag/*` — Release 页面（非下载）
- `github.com/*/releases/expanded_assets/*` — 资源列表页（非下载）
- `avatars.githubusercontent.com/*` — 头像（正常浏览）
- `api.github.com/*` — API 请求（正常浏览）
- `gist.github.com/*` — Gist 页面（非下载，下载走 `gist.githubusercontent.com`）

## 数据流
```
用户点击下载
  → Content Script 扫描 DOM，匹配 <a href> 正则
  → 将 href 重写为 https://{代理站}/{原URL}
  → 浏览器通过代理站加速下载

直接访问下载链接
  → DNR 规则匹配
  → 自动 301 重定向到 https://{代理站}/{原URL}
```

## 预设加速源
- `gh-proxy.com`（默认）
- `ghfast.top`
- `ghproxy.vip`
- `ghproxy.link`
- `github.moeyy.xyz`

## 测试
```bash
npm test
```
27 个测试用例，覆盖 URL 匹配、域名验证、DNR 规则生成。
