# 文章模板与语法全集

写新文章时复制下面那段骨架，照着改。这份文件同时是语法的完整清单 ——
**新增或修改任何标记、参数、frontmatter 字段时，这里必须一起改。**

## 这个文件为什么不在 `frontend/content/` 里

放进去它会变成网站的一部分，两个独立的原因：

1. `src/content/posts.js` 用 `import.meta.glob('/content/**/*.md')` 把
   `content/` 下**每一个** md 内联进 JS bundle，不管它是否被路由到 ——
   模板会被打包发给每一个访客。
2. 路由排除是一条硬编码的路径判断（`path !== '/content/README.md'`），
   只挡 README 一个。别的 md 直接放在 `content/` 底下就会变成一个能访问的
   单页，标题为空，没人会注意到。

另外 `scripts/subset-font.mjs` 扫的是 `content/` 和 `src/`。模板里这些示例
文字如果被扫进去，会白白给四个字体各加一批用不上的字形。

所以它在 `docs/`：不被 glob、不被路由、不进字体子集。**不要把它移进
`frontend/content/`。**

---

## 复制这一段开始写

```markdown
---
title:
  en: English Title
  zh: 中文标题
original: 原名                 # 可选
year: 1994                     # 可选
date: 2026-08-20               # 列表按这个倒序排
rating: 9                      # 可选，0–10
verdict:                       # 可选，一句话总评，只出现在列表卡片上
  en: One line that sums it up.
  zh: 一句话概括。
cover: /image/xxx.jpg          # 可选，列表卡片上的封面图
featured: true                 # 可选，置顶到栏目页顶部
fontScale: 1.0                 # 可选，正文字号倍率，0.8–1.6
contact:                       # 可选，只有单页会渲染。见下面「联系方式」
  - { label: email, value: you@example.com, href: "mailto:you@example.com" }
tags:
  en: [Tag A, Tag B]
  zh: [标签甲, 标签乙]
---

<!-- en -->

Opening paragraph.

# Section

Body under the section.

## Subsection

Body under the subsection.

<!-- zh -->

开头一段。

# 一级章节

章节下的正文。

## 二级小节

小节下的正文。
```

单语文章可以整段省掉 `<!-- en -->` / `<!-- zh -->`，两种语言会共用同一份正文。

---

## 文件位置决定 URL

```
content/review/films/chungking-express.md   →  /review/films/chungking-express
content/blog-post/hello.md                  →  /blog-post/hello
content/abt-me.md                           →  /abt-me      单页
content/home.md                             →  /            主页
```

- 目录名要和 `src/components/nav/sections.js` 里的 `slug` 对上，文章才会出现在
  对应栏目页里
- **直接放在 `content/` 底下（不在子目录里）的是"单页"**：不进任何列表、
  不排序、不参与置顶，页面上只有标题和正文
- 文件名就是 URL，**永远用 ASCII slug**。中文只出现在显示层（`sections.js`
  的 `label`、frontmatter 的 `title`）

### 单页 + 子页

一个单页可以再带几个子页，`abt-me` 就是这么组织的：

```
content/abt-me.md                →  /abt-me              TL;DR，进来先看到的
content/abt-me/experience.md     →  /abt-me/experience   子页
content/abt-me/hobbies.md        →  /abt-me/hobbies
content/abt-me/this-site.md      →  /abt-me/this-site
```

`/abt-me` **不会变成列表页**：`Resolve.jsx` 里 `page` 的优先级高于 `Section`，
所以那一页永远是 `abt-me.md`。

**子页的入口只在底栏的二级菜单里，页面上不重复列一遍** —— 和栏目页是同一个
取舍（见 `Section.jsx` 里"子栏目在底栏导航里，这里不重复"那句）。

要加一个子页得动两处，缺一不可：

1. `content/abt-me/<slug>.md` 建文件
2. `src/components/nav/sections.js` 的 `abt-me.children` 里加一条

只建 md 不加 `children`：页面能直接访问，但不进底栏菜单，没有任何地方链接到它。
只加 `children` 不建 md：底栏菜单里会留一个点进去 404 的链接。

子页走的是文章那套组件，所以 frontmatter 的 `date` / `rating` / `tags` 都能用；
不写就整行不渲染。

---

## frontmatter 字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | 字符串或 `{en, zh}` | 渲染成页面的 **h1** |
| `original` | 字符串 | 原名。文章页和卡片都显示 |
| `year` | 数字 | 年份 |
| `date` | `YYYY-MM-DD` | 列表按它倒序排 |
| `rating` | 数字 0–10 | 评分条。显示时会 `Math.round`，写 8.5 画成 9 格，但数字仍显示 8.5 |
| `verdict` | 字符串或 `{en, zh}` | 一句话总评，**只**出现在列表卡片上，文章页不显示 |
| `cover` | 路径 | 卡片封面图，`public/` 起算。不写就是空占位。卡片图是 `loading="lazy"` 的 |
| `featured` | `true` | 置顶到栏目页顶部那张大卡 |
| `fontScale` | 数字 0.8–1.6 | 正文字号**倍率** |
| `tags` | 数组或 `{en, zh}` | 标签。两边可以条数不同 |
| `contact` | 数组 | 联系方式，渲染成命令输出的样子。**只有单页（MarkdownPage）会渲染**，文章页忽略 |

全部可选，只有 `title` 实际上不能省（省了页面标题是空的）。

### `{en, zh}` 的通用规则

`title` / `verdict` / `tags` 都可以写成双语对象，也可以直接写一行：

```yaml
tags: [meta]              # 两种语言共用这一份
tags:
  en: [meta, notes]
  zh: [杂谈, 笔记]         # 各显示各的，条数不必相同
```

只写了一种语言时，另一种回退到已有的那份。

### `fontScale` 是倍率不是字号

基准字号本身跟着视口缩放（`src/components/fonts.css` 的
`--content-font-size`，17px→24px）。写死绝对字号等于让这篇退出那套缩放，
大屏上会重新变得太小。倍率是叠上去的，两者不冲突。

超出 0.8–1.6 会 `console.warn` 并按边界处理；写了非数字同样 `console.warn`
并忽略。

### 联系方式

```yaml
contact:
  - { label: linkedin, value: /in/your-handle, href: "https://www.linkedin.com/in/your-handle" }
  - { label: github,   value: "@your-handle",  href: "https://github.com/your-handle" }
  - { label: email,    value: you@example.com, href: "mailto:you@example.com" }
  - { label: location, value: "Auckland, New Zealand" }
```

渲染成：

```
$ contact --list
linkedin   /in/your-handle
github     @your-handle
email      you@example.com
location   Auckland, New Zealand
```

| 键 | 说明 |
| --- | --- |
| `label` | 左列。字符串或 `{ en, zh }` |
| `value` | 右列显示的字。不写就退回显示 `href` |
| `href` | 可选。写了就是链接（新窗口打开），不写就是纯文字，适合地点这类 |

三个键一个都没有的项会被跳过并 `console.warn` —— 静默跳过的话页面上只是少一行，
看不出来。

**值里有逗号必须加引号**（`"Auckland, New Zealand"`）：YAML 的流式映射用逗号
分隔键值对，不加引号会把后半截当成新的键，解析直接出错。

两列是 CSS grid 对齐的，**不要试图用空格对齐** —— 站点字体不是等宽的
（实测 `iiiiiiiiii` 47.84px 对 `MMMMMMMMMM` 127.56px）。

字号跟着这一页的 `fontScale` 走，和正文一致。

### 置顶怎么定

1. 有 `featured: true` 的，在这些里面选
2. 都没标，就在全部文章里选
3. 上述范围内取 **rating 最高**的
4. 打平（标了多篇、或评分相同）取**日期最新**的

**只有叶子栏目才有置顶。** `/review` 汇总了好几个媒介，"最推荐的那部"跨媒介
比不出来，所以它只按时间平铺，每个子栏目的置顶各自加星。

---

## 双语正文

```markdown
<!-- en -->
English body…

<!-- zh -->
中文正文……
```

- **只认 `en` 和 `zh`。** 写 `<!-- cn -->` 不会报错，但也匹配不上 ——
  更糟的是只匹配到一个标记时，另一种语言会拿到 `undefined` 并回退，
  两种语言都显示成两段拼在一起的一大坨，页面上还会印出 `<!-- cn -->` 这行
  字面量（正文走 token 不走 HTML 字符串，浏览器解析器没机会吞掉注释）
- 一个标记都不写 = 两种语言共用全文
- 只写一种 = 另一种回退到它

---

## 正文 Markdown

**能用**（实测过）：

| 语法 | 渲染成 |
| --- | --- |
| `# 标题` | `<h2>` |
| `## 标题` | `<h3>`，依此类推，最深到 `<h6>` |
| `**粗体**` | `<strong>` |
| `*斜体*` | `<em>` ——  **但两个字体都没有斜体**，看起来和正文一样 |
| `~~删除~~` | `<del>` |
| `` `行内码` `` | `<code>` |
| ` ```围栏``` ` | `<pre><code>` |
| `> 引用` | `<blockquote>` |
| `- 项` / `1. 项` | `<ul>` / `<ol>` |
| `---` | `<hr>` |
| `[文字](链接)` | `<a>`，一律新窗口打开 |

**不能用**（实测：原样当纯文字显示，不报错）：

- `![alt](图片)` —— **markdown 图片语法无效**。正文里插图目前只有
  `[tooltip img="…"]` 这一条路
- `| 表格 |` —— 表格语法无效，会显示成一行竖线和文字

### 章节标题

分段就用 Markdown 的井号，两级够用：

```markdown
# 一级章节        →  <h2>   青色分段灯条 + 向右铺开的半椭圆辉光
## 二级小节       →  <h3>   磷光绿灯条，细一档、暗一档
### 三级          →  <h4>   只有一根暗条，不发光
```

层级不只靠字号：每级标题左边有一根分段的 LED 灯柱，颜色、粗细和辉光强度
逐级递减，扫一眼就分得出来。灯条跟着行高走，标题换行时会一起变长。

一篇文章用到三级通常说明该拆文章了。

**标题从 `<h2>` 起**，因为 frontmatter 的 `title` 已经渲染成页面的 `<h1>`
（54px）。写 `#` 得到的是二级，这是对的，不要为了"看起来像一级"去写 `#` 以外
的东西。

**不要为标题新增方括号标记。** `[名字]…[/名字]` 是作用在行内文本上的：单独
占一行的标记实测仍然渲染成 `<p>` 里的一个 inline span，字号和正文一样，做不出
真正的 `<h2>`。那样只是一段"看起来像标题"的段落，语义和无障碍都更差，而井号
已经把这件事做对了。

---

## 方括号标记

### 语法总则

```
[名字=简写值]文字[/名字]                      简写值：一直取到 ]，中文标点空格都能直接写
[名字 key="值" key2="值"]文字[/名字]          具名参数：值带空格就得加引号
[名字]文字[/名字]                             不带参数
```

- 简写值和具名参数**二选一，不能混用**。要两个以上参数就用具名的
- 开闭标记必须同名，没配对的会原样当普通文字显示，不会把页面搞崩
- **标记内部不要再嵌 Markdown**（`[spoiler]**粗体**[/spoiler]` 不叠加）
- 参数名写错**不会报错也不会看出来** —— 高亮样式照上，但那条参数没生效。
  以这份文件的表格为准

### `[tooltip]` 悬浮说明

```
[tooltip=一句话]某个词[/tooltip]
[tooltip content="一句话"]某个词[/tooltip]
[tooltip content="一句话" img="/image/still.jpg"]某个词[/tooltip]
[tooltip img="/image/still.jpg"]只有图也行[/tooltip]
```

| 参数 | 说明 |
| --- | --- |
| 简写值 / `content` | 说明文字。两者等价 |
| `img` | 图片路径，`public/` 起算（图放 `public/image/`）。图在上、字在下 |
| `maxw` | 框的最大宽度，默认 320px |
| `maxh` | **图片**的最大高度 |
| `width="image"` | 框跟着图走：图按原始宽度铺开，框跟上去 |
| `width="text"` | 图跟着文字走：框由文字撑开，图缩放到正好这么宽 |

`maxw` / `maxh` 写纯数字按 px 算（`maxw="480"`），也收带单位的 CSS 长度
（`maxw="30em"`）。认不出的值会被忽略并 `console.warn`。

关于 `width` 的三种情况：

- 不写：图按原始宽度显示，超过框宽才缩小。图比文字窄时右边会空一块
- `width="image"`：图说了算，框跟着变宽
- `width="text"`：文字说了算，图被拉伸或压缩到文字宽度。**图比文字窄时会被
  放大**，像素图放大会糊

两个 `width` 值都需要配合 `img`。`width="text"` 还需要有文字 —— 只有图时
会 `console.warn` 并降级回默认宽度（否则框会缩成 20 来 px）。

`maxh` 限的是图不是整个框：框上加高度限制会裁掉下面的文字，而 tooltip 是
`pointer-events: none` 的，裁掉就再也看不到。

**不管 `maxw` 写多大都超不过视口。** tooltip 越界会给页面撑出横向滚动，
而背景是 `position: fixed` 的，页面能横着滑它却不动，正文就整体错开一截。

图片**不占首屏，但也不会让你等**：tooltip 整个节点只在激活时才挂进 DOM，
所以图不参与首屏加载；同时页面上每个带图的高亮会在挂载后趁浏览器空闲把图
悄悄拉进缓存，等真正悬浮时直接命中，框一次成型。预热范围就是当前这一页 ——
只有挂载着的高亮才预热。

### `[spoiler]` 剧透遮罩

```
[spoiler]结局是……[/spoiler]
```

不带参数。盖一层雪花，悬浮或点一下才显形。

### `[link]` 外链

```
[link=https://example.com]某处[/link]
[link href="https://example.com" tip="悬浮时的说明"]某处[/link]
```

| 参数 | 说明 |
| --- | --- |
| 简写值 / `href` | 目标地址。两者等价 |
| `tip` | 可选，悬浮时浮出的说明 |

一律新窗口打开（`noopener,noreferrer`）。没有地址会 `console.warn`。

和 markdown 的 `[文字](地址)` 不冲突：标记解析要求有配对的闭合标签，
markdown 链接没有，不会被误判。

### `[settings]` 指向设置面板

```
[settings]SETUP[/settings]
```

不带参数。悬浮时在底栏 SETUP 按钮上方冒一个箭头指着它。**这是指路标不是
入口** —— 面板照旧从按钮或 F10 打开。

---

## 加新标记时

一条新交互 = `src/highlight/actions.js` 里加一项，组件不用动。

加完之后**回到这份文件补上它的语法和全部参数**，同时更新
`frontend/content/README.md`。参数名和文档对不上的时候，页面看起来完全正常，
只是那条参数是死的 —— 站上所有 tooltip 曾经因为这个整体失效过一次
（`tooltip` 读 `attrs.text`，而文档和文章都写 `content=`）。
