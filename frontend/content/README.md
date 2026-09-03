# 文章目录

目录结构直接就是 URL：

```
content/review/films/chungking-express.md  →  /review/films/chungking-express
content/blog-post/hello.md                 →  /blog-post/hello
```

栏目本身在 `src/components/nav/sections.js` 里定义。这里的目录要和那边的
`slug` 对上，文章才会出现在对应的栏目页里。

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

没有 `<!-- en -->` / `<!-- zh -->` 标记的话，两种语言会共用同一份正文。
只写了一种语言时，另一种会回退到已有的那份。

`tags` 也是一样的规矩：写成 `en` / `zh` 两份就各显示各的，直接写一行
`tags: [meta]` 就是两种语言共用 —— 像 `1990s` 这种两边本来就一样的词
不用写两遍。两份都写的时候，两边的条数不必相同。

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

`img` 是站点根目录起算的路径，图片放在 `public/image/` 下。图会按 tooltip
的宽度等比缩放，只写 `img` 不写 `content` 也可以。

要加新的交互类型，只往 `actions.js` 里加一条就行，不用动组件。

注意：标记内部不要再嵌 Markdown 语法（比如 `[spoiler]**粗体**[/spoiler]`），
两套解析目前不叠加。
