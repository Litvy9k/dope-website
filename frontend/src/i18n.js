/**
 * UI 文案。结构和 nav/sections.js 的 label 一致，都是 { en, zh }。
 *
 * 只放"人读的词"。命令和语法（ls / cd / $ / ~ / F10 / ESC）不进这里 ——
 * 那是语法不是英语，翻译反而不对。
 */
const strings = {
  setup: { en: 'SETUP', zh: '设置' },
  close: { en: 'CLOSE', zh: '关闭' },

  scanlines: { en: 'Scanlines', zh: '扫描线' },
  sweep: { en: 'CRT Sweep', zh: '扫描光带' },
  flicker: { en: 'Screen Flicker', zh: '屏幕闪烁' },
  pixelFont: { en: 'Pixel Font', zh: '点阵字体' },

  // 语言开关两边都写"中文"：它要是跟着语言变，看不懂当前语言的人就找不到它了
  chinese: { en: '中文', zh: '中文' },

  placeholder: { en: 'placeholder', zh: '占位页' },
  subsections: { en: 'subsections', zh: '个子栏目' },
};

export function t(key, lang) {
  return strings[key]?.[lang] ?? strings[key]?.en ?? key;
}
