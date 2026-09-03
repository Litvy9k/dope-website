/**
 * 高亮标记能触发的事件，全部在这里定义。
 *
 * 想加新事件，只要在下面加一项，正文里写 [名字]...[/名字] 就能用，
 * 不用动任何组件代码，也不用给页面传 prop。
 *
 * 每一项是一个函数，收到 { value, attrs, ui }，返回给 <HighlightText> 的 props：
 *
 *   value  —— [名字=这里] 的简写值
 *   attrs  —— [名字 key="这里"] 的具名参数
 *   ui     —— Layout 提供的界面控制，见 components/UIContext.jsx
 *
 * 能返回的 props：
 *   tooltip       浮出的信息框内容
 *   onActivate    悬浮进入 / 触屏点击 / 键盘聚焦时触发
 *   onDeactivate  移开 / 点别处 / 失焦时触发
 *   onSelect      明确的点击或回车，和悬浮无关
 */

export const actions = {
  /**
   * [tooltip=1996 年，王家卫]重庆森林[/tooltip]
   * [tooltip content="1996 年，王家卫"]重庆森林[/tooltip]
   *
   * 没有内容的 tooltip 会渲染成一段"看着像高亮、点了却没反应"的文字：
   * 样式照上，但 HighlightText 判定它不可交互，连 tabIndex 都不给。
   * 从页面上看不出是参数名写错了，所以这里要喊一声。
   */
  tooltip: ({ value, attrs }) => {
    const text = value ?? attrs.content;
    if (!text) {
      console.warn('[highlight] [tooltip] 没有内容，写成 [tooltip=文字] 或 [tooltip content="文字"]');
    }
    return { tooltip: text };
  },

  /** [settings]SETUP[/settings] —— 悬浮时在底栏 SETUP 按钮上方冒一个箭头指着它。
      这是指路标不是入口：面板照旧从按钮或 F10 打开 */
  settings: ({ ui }) => ({
    onActivate: ui.showSetupHint,
    onDeactivate: ui.hideSetupHint,
  }),

  /** [spoiler]结局是……[/spoiler] —— 盖一层雪花，点了或悬浮才显形 */
  spoiler: () => ({ spoiler: true }),

  /** [link=https://example.com]某处[/link] 或 [link href="..." tip="说明"]某处[/link] */
  link: ({ value, attrs }) => {
    const href = value ?? attrs.href;
    // 同上：没有地址就别装成能点，否则点下去只会开一个 about:blank
    if (!href) {
      console.warn('[highlight] [link] 没有地址，写成 [link=地址] 或 [link href="地址"]');
    }
    return {
      tooltip: attrs.tip,
      onSelect: href ? () => window.open(href, '_blank', 'noopener,noreferrer') : undefined,
    };
  },
};
