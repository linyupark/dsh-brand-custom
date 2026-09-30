# dsh-brand-custom

[English](README.md) | 中文

纯 UI 插件:自定义 DSH Web UI 的品牌 logo 与文案。不改动 DSH 安装目录里的任何文件,
只占用官方槽位(slot)与 locale 服务的公开 API,因此 DSH 升级不受影响。

## 覆盖范围

| 位置 | 槽位 / 机制 |
| --- | --- |
| 左上角 logo(展开行与折叠轨道) | `sidebar.brand.mark` |
| 左上角名称 | `sidebar.brand.name` |
| 对话框 Hero 的 logo | `conversation.hero.brand.mark` |
| 「探索未至之境」 | locale 词条 `conversation:hero.headline`(自定义语言变体) |
| 「预览版」徽标 | locale 词条 `conversation:hero.preview`(自定义语言变体) |

任意字段留空即回退 DSH 默认(留空 logo 显示原生 fish,留空文案显示原生文案)。

## 安装

```sh
dsh plugin --profile <profile> add github:linyupark/dsh-brand-custom
```

然后在 profile 的 `package.json` 里把 `"dsh-brand-custom"` 加入 `dsh.profile.bundles`,
或在 **设置 → 插件** 里启用该 bundle。

本地 checkout 的用法:装一次运行依赖,再把目录 link 进 profile。

```sh
git clone git@github.com:linyupark/dsh-brand-custom.git
cd dsh-brand-custom
bun install        # 或 pnpm install / npm install
```

## 配置

在 DSH 的插件页面(**设置 → 插件 → dsh-brand-custom**)直接编辑(表单由插件的
`Config` schema 自动生成),或改本包的 `cordis.patch.yml` / profile 层的行配置。字段:

| 字段 | 说明 |
| --- | --- |
| `sidebarLogo` | 侧栏 logo。三种写法:内联 SVG(以 `<` 开头)、图片地址(`https:` / `data:` / `/`)、或纯文本/emoji |
| `sidebarName` | 侧栏品牌名 |
| `heroLogo` | Hero logo,写法同上 |
| `heroHeadline` | Hero 主标题 |
| `heroBadge` | Hero 徽标文字 |
| `languageLabel` | 自定义语言在设置里的显示名,默认「原语言名 (自定义)」 |

内联 SVG 用 `currentColor` 可自动跟随主题文字色:

```yaml
sidebarLogo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" stroke-width="5"/></svg>'
```

配置通过 `webserver/index-inject` 注入的全局量(`__DSH_BRAND_CUSTOM__`)到达浏览器,
与官方 `dsh-client-shortcuts`、`dsh-client-ui-theme` 同一套机制,因此改完需要刷新页面。

## 文案是怎么被覆盖的

`hero.headline` / `hero.preview` 属于 `ui-conversation` 自己的 i18n 命名空间,locale
服务对 `(命名空间, 语言)` 强制单一占用,插件无法直接覆盖这两个词条。本插件的做法是:

1. 按当前语言注册一个变体语言,例如 `zh-x-dsh-brand`,fallback 指向 `zh`;
2. 只在变体下注册被覆盖的两个词条,其余词条回落到原语言;
3. 把当前语言偏好切到该变体。

副作用(有意如此):设置 → 通用 → 语言里会多出「中文 (自定义)」一项;插件启用期间会写入
一次语言偏好,因此刷新后仍生效;若手动选回原生「中文」,本次会话内文案恢复原生,刷新后
再次切回变体。禁用插件会移除该变体语言,语言偏好自动回落到浏览器默认(存储的 id 会残留,
与 locale 服务的文档一致)。

## 槽位优先级

`sidebar.brand.mark` / `sidebar.brand.name` 是 single 槽位,官方 `ui-brand-official` 在
official 构建下已用默认优先级 0 占用;single 槽位按优先级升序只渲染**最低**的那个,且同优先级
重复注册会直接抛错。因此本插件统一以 `priority: -1000` 注册(见 `client.js` 的
`OCCUPANT_PRIORITY`):既避开与官方占用者同优先级的冲突,又能稳定地遮蔽它。动态客户端插件
(cordis 动态包)从 -1 依次递减,不会与我们相撞。

## 已知限制

- Hero 徽标的外框由 DSH 绘制,无法隐藏,只能改文字。
- 配置在页面加载时注入 client 半,改完配置(或在页面已打开时新装插件)需要刷新页面。
- 浏览器标签页标题由构建期环境变量 `DSH_CLIENT_TITLE` 决定,不属于 UI 槽位。
- 远程图片 logo 需要页面能访问该地址;内联 SVG 最稳妥(可用 `currentColor` 跟随主题)。

## License

MIT