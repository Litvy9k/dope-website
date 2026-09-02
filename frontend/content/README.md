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
date: 2026-08-20            # 列表按这个倒序排
tags: [王家卫, 香港]          # 可选
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

## 可交互标记

正文里可以用方括号标记，能用哪些看 `src/highlight/actions.js`：

```
[tooltip content="悬浮出来的说明"]某个词[/tooltip]
[spoiler]会被雪花盖住，点一下才显形[/spoiler]
[link href="https://example.com" tip="说明"]某处[/link]
[settings]SETUP[/settings]
```

要加新的交互类型，只往 `actions.js` 里加一条就行，不用动组件。

注意：标记内部不要再嵌 Markdown 语法（比如 `[spoiler]**粗体**[/spoiler]`），
两套解析目前不叠加。
