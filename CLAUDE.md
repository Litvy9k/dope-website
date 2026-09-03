# dope-website

赛博朋克 / CRT 风格的个人站。前端 React 19 + Vite，纯静态；`backend/` 是
.NET 占位，暂未使用。中英双语。

线上：http://107.149.92.201

## 架构

```
frontend/content/          文章（markdown），目录结构 = URL
  review/<媒介>/<slug>.md    → /review/<媒介>/<slug>
  blog-post/<slug>.md        → /blog-post/<slug>
frontend/src/
  content/posts.js         构建时 import.meta.glob 读入、解析 frontmatter
  content/Markdown.jsx     marked 的 token → React（不是 HTML 字符串）
  highlight/               正文里的 [标记] 系统
  components/nav/sections.js  栏目树，路由/导航/面包屑的唯一来源
  i18n.js                  UI 文案，{ en, zh }
frontend/font-source/     完整字体，只作子集化的输入，不部署
frontend/scripts/subset-font.mjs   生成 public/font/*.subset.woff2
```

文章格式和可用标记见 `frontend/content/README.md`。

## 定下的规则

**语法不翻译，名字才翻译。** `ls` / `cd` / `$` / `~` / `[F10]` / `[ESC]` 是
语法不是英语，不进 i18n；路径段、栏目名、UI 词汇跟着语言切。URL 永远用
ASCII slug，显示层才用中文。

**只有一套标记系统。** `highlight/parse.js` 的 `[名字 key="值"]…[/名字]`
已支持具名参数，不要再引入 XML 式语法。加新交互只往
`highlight/actions.js` 加一条，组件不用动。**参数名必须和
`content/README.md` 写的一致** —— 对不上时高亮照样有样式，只是不可交互，
页面上看不出区别（`tooltip` 一直读 `attrs.text`，而正文和文档写的都是
`content=`，于是所有 tooltip 静悄悄失效）。现在缺内容会 `console.warn`，
新加 action 也照着写一句。

**Markdown 走 token 不走 HTML 字符串。** 正文里的 `[标记]` 要变成带事件的
React 组件，HTML 字符串塞不进去。相邻文本 token 必须先合并，否则
marked 会把一个标记拆到两个 token 里导致配不上对。

**中文字体是构建时生成的子集。** 完整的思源宋体 22.8MB，站点实际只用到一千
出头个字符。`scripts/subset-font.mjs` 扫 `content/` 和 `src/` 里的所有文字，
子集化成 380KB 的 woff2，`predev` / `prebuild` 会自动跑，所以**加文章不用
手动重新生成**。源字体在 `font-source/`，**别放回 `public/`** —— 那个目录
会被 Vite 原样拷进 dist，等于把 22.8MB 一起发出去。产物不进 git。

**置顶只在叶子栏目。** `/review` 这类汇总页跨媒介，选不出唯一的"最推荐"，
所以只给各子栏目的置顶篇加星并排前面，不做横幅。

## 踩过的坑（都是排查很久才找到的）

**`vite.config.js` 的 `base` 必须是 `/`。** 用 `'./'` 时，`/review/films`
下资源会解析成 `/review/assets/…`，不存在 → 被 nginx 的 SPA 回退成
index.html → 浏览器收到 `text/html` 的 module script → 白屏。**首页完全
正常**，所以只测首页发现不了。

**`index.css` 里不能给 body 加 `display: flex`。** Vite 模板原本有
`display:flex + place-items:center`，它让 React 根节点变成 flex 项，
`min-width:auto` 使其按内容撑开而非受限于视口，窄屏下任何宽元素都会撑破
页面。模板同时带的 `overflow-x: hidden` 正好把症状盖住了。两个都已删除，
**不要加回来** —— 遮罩只会掩盖下一个布局 bug。

**字体没有斜体。** BitPap 和 Oswald 都没有 italic face，浏览器也不做倾斜
合成，实测 `normal` / `italic` / `oblique 14deg` 渲染完全一致。要强调就用
引号、颜色、字号，别写 `font-style: italic`。

**触屏的 focus 早于 click。** 可聚焦元素上无条件 `onFocus={activate}` 会
被随后的 click 切换掉，表现为"第一次点只闪一下"。用
`e.target.matches(':focus-visible')` 区分键盘聚焦和指针点击。

**触屏只有 mouseenter 没有 mouseleave。** 依赖 hover 的状态必须在换页时
主动清除，否则会一直卡住。

**手机上 `background-attachment: fixed` 会在滑动时突然放大。** fixed 背景的
定位区域是视口，而手机往下滑时地址栏收起、视口变高，`cover` 就按新高度重算
缩放 —— 背景整个跳大一截。页面短于一屏时不会触发，所以只看首页发现不了。
背景图 1920x1080 配竖屏，缩放一直是被高度卡住的，高度一变就必跳。
现在改成 `.bg::before` 一层 `position: fixed` 的独立层，高度写 `100lvh`：
固定定位元素量的是布局视口，不随地址栏变化。`dvh` 会跟着变等于没治，
`svh` 不变但太矮、地址栏收起后底部露白。这一层的 `z-index` 是负的，而且
**`.bg` 不能加 `position` / `isolation`** —— 一旦它建立层叠上下文，正文里
`z-index: 1200` 的 tooltip 就压不住 `z-index: 1000` 的底栏了。

**`width: 100vw` 含滚动条宽度**，会导致桌面端多出十几像素的横向滚动条。
用 `100%`。

**布局改动后要验横向溢出**，别只看截图：
`document.documentElement.scrollWidth > clientWidth`。

## 本机环境

- **git push 必须指定 Windows 的 ssh**，Git Bash 自带的 ssh 看不见 Windows
  ssh-agent 里的密钥：
  `GIT_SSH_COMMAND="/c/Windows/System32/OpenSSH/ssh.exe" git push`
  （或者一次性 `git config --global core.sshCommand "C:/Windows/System32/OpenSSH/ssh.exe"`）
- 本机**没有 rsync**，传文件用 `tar -czf - . | ssh … tar -xzf -`
- .NET 只有 9.0 SDK，所以 `backend` 目标框架是 net9.0
- 预览环境不合成画面（rAF 0 帧），**无法验证任何带时间的动画**，只能验最终
  状态和 class 切换。动画观感要让用户本地确认。

## 部署

- 服务器 CentOS 7（已 EOL，yum 源已改指 `vault.centos.org`），nginx 1.26
- 站点目录 `/var/www/dope-website`，配置见 `deploy/nginx.conf`
- **nginx 必须有 `try_files $uri $uri/ /index.html`**，否则深层链接 404
- CI：push 到 master/main 自动构建部署，末尾有冒烟测试（验 4 条路由 +
  JS 的 MIME 类型，正好能抓住上面那个白屏 bug）
- secrets：`SERVER_HOST` / `SERVER_USER` / `SERVER_SSH_KEY`

## 待办

- `content/` 里的王家卫影评、Outer Wilds、两篇博文都是**示例内容**，
  以第一人称写的，上线前要替换或删除
- 栏目名（`review` / `blog-post` / `abt-me`）待定
- `anime` / `books` 两个栏目还没有内容
- 首页和 `abt-me` 仍是占位文字
- `origin/dev` 已完全合并，可以删
- 服务器用 root 部署，可以改成专用 deploy 用户
- 没有 HTTPS（还没有域名，有了之后 `certbot --nginx` 即可）
