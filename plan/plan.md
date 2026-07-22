# GitHub-DL-boost — 计划

## 概述
Chrome 扩展，自动将 GitHub Releases / Raw / Archive / Gist 等下载链接重定向到 gh-proxy 等加速节点，提升国内下载速度。

## 技术选型
- Manifest V3（Chrome 88+）
- 纯 JavaScript，无框架依赖
- Chrome Extension API（`declarativeNetRequest` / `storage` / `contextMenus`）

## 项目结构
```
GitHub-DL-boost/
├── manifest.json          # 扩展清单
├── service-worker.js      # 后台 Service Worker
├── popup/
│   ├── popup.html         # 弹出窗口
│   ├── popup.js           # 弹出窗口逻辑
│   └── popup.css          # 弹出窗口样式
├── options/
│   ├── options.html       # 设置页面
│   └── options.js         # 设置逻辑（代理源管理）
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── plan/
    └── plan.md            # 本计划文件
```

## 功能清单
1. **自动拦截** — 识别 GitHub Releases / Raw / Archive / Gist 等下载链接
2. **URL 重写** — 原始链接自动转为 `{代理站}/原链接`
3. **预设代理源** — 内置 gh-proxy.com / ghfast.top / ghproxy.vip 等
4. **用户自定义代理源** — 设置页可增删改自定义加速站域名
5. **弹出面板** — 显示当前代理源、开关、快速切换
6. **右键菜单** — 一键复制/打开加速链接
7. **智能默认** — 用户未设置时自动启用预设最优节点

## 核心实现

### declarativeNetRequest 动态规则
- Service Worker 在启动/安装时读取存储中的代理源域名
- 动态创建 declarativeNetRequest 规则，匹配 GitHub 下载 URL 并重写为代理链接
- 用户切换代理源时，更新全部动态规则

### 数据流
```
用户点击下载
  → declarativeNetRequest 动态规则匹配
  → URL 自动重写为 https://{用户代理源}/https://原链接
  → 浏览器通过代理站加速下载
```

### 支持的 URL 模式
- `raw.githubusercontent.com/*` — Raw 文件
- `github.com/*/releases/download/*` — Release 附件
- `github.com/*/releases/expanded_assets/*` — Release 页面（间接加速）
- `github.com/*/archive/*` — 代码打包 ZIP/TAR.GZ
- `gist.githubusercontent.com/*` — Gist 文件
- `github.com/*/releases/tag/*` — Release tag 页面
- `avatars.githubusercontent.com/*` — 头像资源
- `api.github.com/*` — API 请求（部分）

## 实施步骤
1. 初始化项目结构、manifest.json、图标
2. 实现 Service Worker 动态规则引擎（支持自定义代理源）
3. 实现弹出面板 UI（开关、当前代理状态）
4. 实现设置页面（代理源列表增删改、预设/自定义切换）
5. 实现右键菜单（复制/打开加速链接）
6. 测试 & 打包

## 预计工时
- 规则引擎 + 动态更新：1h
- 弹出面板：0.5h
- 设置页（核心自定义代理源管理）：1h
- 右键菜单：0.5h
- 测试 & 调优：0.5h
