# 维护指南

仓库：[MatildaHan/blog-whono](https://github.com/MatildaHan/blog-whono)。协作与自动推送规则以根目录 [AGENTS.md](../AGENTS.md) 为准。

## 开发命令

使用 `.nvmrc` 指定的 Node 版本和 npm，保留 `package-lock.json`。

```sh
npm ci
npm run dev
```

`npm run dev:clean` 用于需要清理 Vite 缓存后启动的情况，不作为每次开发的固定步骤。

| 命令 | 用途 |
| --- | --- |
| `npm run check` | Astro 类型/模板检查，以及管理内容源代码边界检查 |
| `npm test` | 运行全部 Vitest 测试 |
| `npm test -- tests/date-only.test.ts` | 只运行指定的相关测试；按任务替换文件名 |
| `npm run build` | 生成生产静态站点到 `dist/` |
| `npm run preview` | 预览已生成的生产产物 |
| `npm run verify` | 依次运行 check、test、build |
| `npm run ci` | 现有 GitHub Actions 使用的完整验证入口，与 verify 相同 |

已有工作流 `.github/workflows/ci.yml` 会在 `main` 推送及面向 `main` 的 PR 上执行 `npm ci` 和 `npm run ci`。修改应先完成与影响范围相符的本地验证，推送后关注远程检查结果。

## 专项检查

根据任务选择，不要求每次全部运行。

- Markdown 渲染、数学公式、Callout 或图片布局：构建后执行 `npm run check:markdown-smoke`。
- 管理内容来源边界：`npm run check:admin-content-source-boundary`，已包含在 `npm run check` 中。
- 编辑器 emoji 边界：`npm run check:admin-editor-emoji-boundary`。
- 生产产物与开发管理功能隔离：使用相同的 `SITE_URL` 和子路径环境构建后，执行 `npm run check:prod-artifacts`。
- 开发控制台及静态预览的 HTTP 边界：`npm run check:preview-admin`；该脚本涉及启动服务和读写测试数据，应先阅读脚本，在隔离环境中执行，避免干扰正在编辑的内容。
- 字体字符覆盖：`npm run check:font-charset`；仅在需要更新字体时使用 `font:charset`、`font:subset` 或 `font:build`。
- 云图片冒烟测试：`npm run smoke:cloud-images`；先阅读脚本并确认测试环境，不能将本地构建成功等同于云存储验证。

## 内容与配置维护

- 文章和动态等 Markdown 位于 `src/content/`；新增字段或修改日期、slug、草稿行为前查看 `src/content.config.ts` 和相应业务逻辑。
- 动态时间统一按北京时间（`Asia/Shanghai`）解析与显示。手写 MD 推荐 `date: "2026-10-20 17:56"`，页面显示 `2026-10-20 17:56`，无需填写 `+08:00`；只写日期时按当天零点处理。已有带 `+08:00` 的格式继续兼容；显式的 `Z` 或其他偏移表示真实时刻，显示时换算为北京时间。排序仍按真实时刻进行。
- 优先通过 `src/data/settings/` 与现有配置入口调整站点，避免在组件中重复写死配置。
- `public/` 中的资源按现有路径规则引用，替换时检查被引用的位置；字体源目录 `tools/fonts-src/` 仅供本地使用，不提交。
- 正式构建应提供实际站点的 `SITE_URL`。未设置时，当前代码使用 `example.invalid` 作为 RSS 回退地址，并省略 canonical/OG URL 和 sitemap 等内容；构建通过不能证明这些地址正确。
- 子目录部署使用 `ASTRO_WHONO_BASE_PATH`，验证导航、静态资源、RSS 和 sitemap 中的路径。不要根据仓库名称擅自设定部署路径或域名。
- 当前 `netlify.toml` 的构建命令为 `npm run build`，发布目录为 `dist`；配置文件存在不代表实际已配置或完成托管。

## 每次交付

1. 检查远程、分支和工作区差异，识别并保留已有修改。
2. 完成本次任务，按影响执行验证，检查 `git diff --check`。
3. 获取远程最新状态，处理必要的同步；仅暂存本次修改，阅读 `git diff --cached`。
4. 使用清晰的提交说明，例如 `docs: establish project maintenance rules` 或 `fix: correct essay date parsing`。
5. 默认普通推送到 `origin/main`，无需再次请求授权；不强推、不上传凭据和生成产物。
6. 报告检查、提交号和目标分支。若只推送了任务分支，应明确尚未进入 `main`；只有取得实际线上证据后才说明已部署。

用户明确要求只讨论、暂不提交或不推送时，优先遵循该次指示。认证、网络或验证失败时，保留工作并报告具体阻塞。
