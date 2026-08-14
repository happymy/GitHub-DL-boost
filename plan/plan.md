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

### 1. Content Script（下载链接重写）
- 注入 `*://github.com/*` 和 `*://gist.github.com/*`
- 监听 DOM 变化（MutationObserver），只重写**确定是下载**的链接：
  - `github.com/*/releases/download/*` — Release 附件
  - `github.com/*/archive/*` — 代码打包
- **`a.href`** 返回绝对 URL，解决 `getAttribute('href')` 返回相对路径的问题
- **不重写** raw/gist 链接 —— 页面内嵌内容（README 图片、文件引用）不会被改写，避免破坏页面显示

### 2. DNR 规则（导航兜底）
- 4 条 `declarativeNetRequest` 动态规则（含 raw/gist）
- **`resourceTypes` 仅 `['main_frame']`** — 只拦截用户主动点击的导航请求
- 页面内嵌资源（图片/样式/脚本/XHR）一律放行，不影响正常浏览
- 点击 raw/gist 链接时由 DNR 重定向到代理站，实现加速

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
用户点击下载（Download ZIP / release 资产）
  → Content Script 匹配 <a href>，改写为 https://{代理站}/{原URL}
  → 浏览器通过代理站加速下载

用户点击 raw/gist 链接（导航）
  → DNR 规则匹配 main_frame 请求
  → 重定向到 https://{代理站}/{原URL}

页面内嵌资源（img/script/css/xhr）
  → 一律放行，不拦截
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
