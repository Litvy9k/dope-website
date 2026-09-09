/**
 * fontScale 的取值与钳制。
 *
 * 单独一个文件不是洁癖：Markdown.jsx 只导出组件，往里加一个普通函数会让
 * react-refresh 失效（eslint 的 react-refresh/only-export-components 会报），
 * 而这个函数现在有两个使用者 —— Markdown 自己，和 MarkdownPage（它要把
 * --md-scale 设在外层，好让联系方式那块跟正文一个字号）。
 */
/**
 * frontmatter 里的 fontScale 是个倍率，不是绝对字号 —— 写死 px 的话这篇
 * 就退出了随视口缩放那套（见 fonts.css 的 --content-font-size），
 * 在大屏上会重新变回"太小"。倍率是叠在基准之上的，两者不打架。
 *
 * 夹在一个区间里：1.3 手滑写成 13 的话，不至于糊一屏才发现。
 */
const SCALE_MIN = 0.8;
const SCALE_MAX = 1.6;

export function scaleOf(value) {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) {
    console.warn(`[fontScale] fontScale "${value}" 不是数字，已忽略`);
    return null;
  }
  const clamped = Math.min(Math.max(n, SCALE_MIN), SCALE_MAX);
  if (clamped !== n) {
    console.warn(`[fontScale] fontScale ${n} 超出 ${SCALE_MIN}–${SCALE_MAX}，按 ${clamped} 处理`);
  }
  return clamped;
}

