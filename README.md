# GitHub-DL-boost

Chrome 扩展，自动将 GitHub 下载链接重定向到加速代理站，提升国内下载速度。

## 安装

1. 打开 `chrome://extensions`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"，选择本项目目录

## 使用

- 安装即用，默认使用 `gh-proxy.com` 加速
- 点击工具栏图标可开关/查看当前代理
- 右键链接 → "复制 GitHub 加速链接" / "打开 GitHub 加速链接"
- 在扩展设置页可增删改代理源

## 支持的下载类型

| 类型 | 示例 |
|------|------|
| Release 附件 | `github.com/*/releases/download/*` |
| 代码打包 | `github.com/*/archive/*` |
| Raw 文件 | `raw.githubusercontent.com/*` |
| Gist 文件 | `gist.githubusercontent.com/*` |

## 预设代理源

`gh-proxy.com` · `ghfast.top` · `ghproxy.vip` · `ghproxy.link` · `github.moeyy.xyz`

## 测试

```bash
npm test
```
