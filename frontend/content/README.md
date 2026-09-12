# 文章目录

**完整的语法清单和可以直接复制的骨架在 `docs/post-template.md`。** 这里是
简版，讲目录结构和常用格式；新增标记或参数时两边一起改。

模板放在 `docs/` 而不是这里，是因为 `posts.js` 会把 `content/` 下每一个 md
内联进 bundle，而路由排除只硬编码了 `README.md` 一个 —— 别的 md 放进来会变成
一个能访问的空标题页面，内容还照样发给每个访客。

目录结构直接就是 URL：

```
content/review/films/chungking-express.md  →  /review/films/chungking-express
content/blog-post/hello.md                 →  /blog-post/hello
```

栏目本身在 `src/components/nav/sections.js` 里定义。这里的目录要和那边的
`slug` 对上，文章才会出现在对应的栏目页里。

**直接放在 `content/` 底下（不在子目录里）的 md 是"单页"，不是文章**：

```
content/home.md    →  /          主页
content/abt-me.md  →  /abt-me    关于我
```

单页不进任何列表、不排序、不参与置顶，页面上只有标题和正文，没有日期评分
标签那些。格式和文章完全一样，标记、中英分栏、`fontScale` 都能用。
加一个新的单页就是加一个 md 加一条 `sections.js` 的栏目，不用动组件。

单页还能再带子页，`abt-me` 就是这样：`content/abt-me.md` 是 `/abt-me` 的
TL;DR，`content/abt-me/*.md` 是子页，入口在底栏的二级菜单里（页面上不重复列）。
加子页要同时建 md 和加 `children` 两处，只做一半的后果见 `docs/post-template.md`。

（`README.md` 是这份说明本身，不算内容，解析时排除掉了。）

## 格式

```markdown
---
title:                      # 双语就写成 en/zh，单语直接写一行字符串
  en: Chungking Express
  zh: 重庆森林
original: 重慶森林             # 原名，可选
year: 1994                  # 可选
rating: 9                   # 0-10，可选。博文一般不写
verdict:                    # 一句话总评，只出现在列表卡片上，可选
  en: One line that sums it up.
  zh: 一句话概括。
date: 2026-08-20            # 列表按这个倒序排
fontScale: 1.2              # 可选，一般不用写。正文字号倍率，不是绝对字号
tags:                       # 可选。两边一样的话直接写一行数组
  en: [Wong Kar-wai, Hong Kong, 1990s]
  zh: [王家卫, 香港, 1990s]
---

<!-- en -->
English body…

<!-- zh -->
中文正文……
```

正文是 Markdown：段落、`**粗体**`、`*斜体*`、列表、`>` 引用、`[文字](链接)`
都能用。

分段标题用井号，两级：`#` 是一级章节（渲染成 `<h2>`），`##` 是二级小节
（`<h3>`）。从 `<h2>` 起是因为 frontmatter 的 `title` 占了 `<h1>`。
每级标题左边有一根洋红霓虹灯管，沿左边下来在左下角拐弯变成底线，粗细和
亮度逐级递减；标题文字和正文同色，层级靠字号和灯管区分。灯管会偶尔抽搐
一下，跟着 SETUP 里的
「屏幕闪烁」开关走，系统关了动画效果时也不动。
标题不要用方括号标记去做 —— 那套是行内的，做不出真正的标题。

**一般不用写 `fontScale`。** 全站正文已经是基准字号的 1.5 倍
（`--md-font-ratio`，见 `src/components/fonts.css`），也就是 25.5px→36px
随视口缩放。`fontScale` 是再叠一层的**倍率**，留给个别要偏离基准的篇目。

写死 `20px` 这种绝对字号等于让这篇退出随视口缩放那套，大屏上会重新变得
太小。取值夹在 0.8–1.6，超出会 `console.warn` 并按边界处理。

主页也是一篇 md：`content/home.md`，路由是 `/`，不进任何列表。

没有 `<!-- en -->` / `<!-- zh -->` 标记的话，两种语言会共用同一份正文。
只写了一种语言时，另一种会回退到已有的那份。

`tags` 也是一样的规矩：写成 `en` / `zh` 两份就各显示各的，直接写一行
`tags: [meta]` 就是两种语言共用 —— 像 `1990s` 这种两边本来就一样的词
不用写两遍。两份都写的时候，两边的条数不必相同。

单页还能在 frontmatter 里写 `contact`，渲染成一段命令输出样子的联系方式
（`$ contact --list` + 两列对齐）。字段和注意事项见 `docs/post-template.md`。

## 置顶那篇怎么定

栏目页顶上那张横跨整行的大卡：

1. frontmatter 里写 `featured: true` 的那篇
2. 都没标就取评分最高的
3. 并列时（标了多篇、或者评分打平）取日期最新的

**只有叶子栏目才有置顶。** `/review` 这种带子栏目的页面汇总了好几个媒介，
"最推荐的那部"跨媒介比不出来，所以它只按时间平铺。

## 可交互标记

正文里可以用方括号标记，能用哪些看 `src/highlight/actions.js`：

```
[tooltip content="悬浮出来的说明"]某个词[/tooltip]
[tooltip content="说明" img="/image/still.jpg"]某个词[/tooltip]   # 图在上，字在下
[spoiler]会被雪花盖住，点一下才显形[/spoiler]
[link href="https://example.com" tip="说明"]某处[/link]
[settings]SETUP[/settings]
```

`[link]` 的地址直接写就行，`[link=https://example.com]某处[/link]` 这种简写也认。
但**正文里单独写一个裸 URL 不会自动变成链接**，要链接就显式写标记或者
markdown 的 `[文字](地址)`。另外 `[link]` 渲染成的是按钮不是 `<a>`，中键开新
标签和右键复制地址都没有 —— 普通外链用 markdown 写法更好，细节见
`docs/post-template.md`。

桌面端光标会区分：像素锁链 = 点了跳出去（`[link]`），手型 = 点了原地发生事
（`[spoiler]`），问号 = 悬浮出说明（`[tooltip]` / `[settings]`），普通箭头 =
这条标记写坏了。

悬浮 `[link]` 时底栏那条命令行还会回显目标地址，移开恢复。不写 `tip` 也有
这两样反应，所以它不会看着像一个还没加载出来的 tooltip；`tip` 写了才弹框，
弹的也只有你写的那句话。窄屏上底栏回显是关掉的。

`img` 是站点根目录起算的路径，图片放在 `public/image/` 下。图会按 tooltip
的宽度等比缩放，只写 `img` 不写 `content` 也可以。

图片**不占首屏，但也不会让你等**：tooltip 只在激活时才挂上去，所以图不参与
首屏加载；同时当前页面上每个带图的高亮会在挂载后趁空闲把图预热进缓存，
第一次悬浮就不会再看到框先出来、图随后撑开。

### tooltip 的尺寸参数

```
[tooltip content="…" maxw="480"]某个词[/tooltip]              最宽 480px（默认 320px）
[tooltip content="…" img="/image/x.jpg" maxh="200"]…[/tooltip]  图最高 200px
[tooltip content="…" img="/image/x.jpg" width="image"]…[/tooltip]  框跟着图走
[tooltip content="…" img="/image/x.jpg" width="text"]…[/tooltip]   图跟着文字走
```

| 参数 | 作用 |
| --- | --- |
| `maxw` | tooltip 的最大宽度。不写是 320px |
| `maxh` | **图片**的最大高度。不是整个框的——框上加高度限制会把下面的文字裁掉，而 tooltip 不吃鼠标事件，裁掉就没法再看到 |
| `width="image"` | **框跟着图走**：图按原始宽度铺开，框跟上去。用来展示不该被 320px 压缩的图 |
| `width="text"` | **图跟着文字走**：框由文字撑开，图缩放到正好这么宽。用来让图和文字左右对齐，不管图原本多大 |

`width` 的两个值是相反的方向，都需要配合 `img`：

- 不写 `width`：图按原始宽度显示，超过框宽才缩小。图比文字窄时右边会空一块
- `width="image"`：图说了算，框跟着变宽（仍受 `maxw` 和视口约束）
- `width="text"`：文字说了算，图被拉伸或压缩到文字的宽度。**图比文字窄时会被放大**，
  像素图放大会糊

`maxw` 和 `maxh` 写纯数字按 px 算（`maxw="480"`），也接受带单位的 CSS 长度
（`maxw="30em"`）。写了认不出的值会被忽略并在控制台 `console.warn`——
CSS 会把非法的自定义属性当没写，页面看着一切正常，只是那条限制没生效。

**不管写多大，都超不过视口。** tooltip 越界会给页面撑出横向滚动，而背景是
`position: fixed` 的，页面能横着滑它却不动，正文就整体错开一截。所以上限
永远是 `maxw` 和"视口减掉边距"里更小的那个。

要加新的交互类型，只往 `actions.js` 里加一条就行，不用动组件。

注意：标记内部不要再嵌 Markdown 语法（比如 `[spoiler]**粗体**[/spoiler]`），
两套解析目前不叠加。
