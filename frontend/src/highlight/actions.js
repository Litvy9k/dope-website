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
  /** [tooltip=1996 年，王家卫]重庆森林[/tooltip] */
  tooltip: ({ value, attrs }) => ({
    tooltip: value ?? attrs.text,
  }),

  /** [settings]settings tab[/settings] —— 悬浮弹出左下角设置面板 */
  settings: ({ ui }) => ({
    onActivate: ui.openTray,
    onDeactivate: ui.closeTray,
  }),

  /** [link=https://example.com]某处[/link] 或 [link href="..." tip="说明"]某处[/link] */
  link: ({ value, attrs }) => ({
    tooltip: attrs.tip,
    onSelect: () => window.open(value ?? attrs.href, '_blank', 'noopener,noreferrer'),
  }),
};
