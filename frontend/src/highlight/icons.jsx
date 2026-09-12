/**
 * 高亮用的像素图标。
 *
 * 和底栏那个设置箭头（nav/ShellNav.jsx）一样，用 <rect> 一格一格拼出来，
 * 配 shapeRendering="crispEdges" 保证放大后每一格仍然是方的，不会被抗锯齿
 * 抹成灰边 —— 这是站点的像素调子，不是省事。
 *
 * 不用 Unicode 的锁链字形（⛓ / 🔗）：站点的四个字体都是子集产物，JSX 里的
 * 符号本来就要手动补进子集的基线；而且 CLAUDE.md 记着 ✦ 和 ❙ 在思源宋体和
 * Oswald 里根本不存在，会静默掉回系统字体 —— 一个图标在四种字体 × 两种语言
 * 下长相不一，比画出来麻烦得多。自己画的 SVG 到哪儿都一样。
 *
 * fill 用 currentColor，跟着用它的地方走，颜色不在这里定。
 *
 * **这个文件只导出组件**，坐标和 data URI 生成在 chain.js —— eslint 的
 * react-refresh/only-export-components 不允许组件文件再导出别的东西
 * （content/fontScale.js 单开一个文件是同一个原因）。
 */
import { CHAIN_RECTS, CHAIN_VIEWBOX } from './chain';

/** 锁链。图形本身和那一串几何参数见 chain.js */
export function ChainIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${CHAIN_VIEWBOX} ${CHAIN_VIEWBOX}`}
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
    >
      {CHAIN_RECTS.map(([x, y, w], i) => (
        <rect key={i} x={x} y={y} width={w} height="1" />
      ))}
    </svg>
  );
}
