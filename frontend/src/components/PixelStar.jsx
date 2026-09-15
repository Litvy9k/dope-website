import './PixelStar.css';

/**
 * 荧光黄的像素五角星。置顶的帖子卡片（PostCard.jsx）和 GitHub 页的置顶
 * 仓库卡片（pages/GitHubPage.jsx）共用这一颗。
 *
 * 逐格拼出来的，不用 ★ 字符 —— 点阵字体不一定有那个字形，掉回系统字体
 * 就不是方块星了（CLAUDE.md 里 ✦ 和 ❙ 就是这么出事的）。
 *
 * 这里只管星星长什么样（形状、颜色、辉光）。**摆在哪儿由用它的地方决定**：
 * 传 className，定位和尺寸写在调用方自己的样式表里。两处的卡片内边距、
 * 边框粗细都不一样，星星的位置本来就该各算各的。
 *
 * 抽出来之前这 9 个 rect 写在 PostCard 里；GitHub 页要同一颗星，抄一份的话
 * 以后改星形只会改到一边 —— 和 highlight/chain.js 把锁链坐标抽出来是同一个理由。
 */
export default function PixelStar({ className = '' }) {
  return (
    <span className={`pixel-star ${className}`} aria-hidden="true">
      <svg viewBox="0 0 9 8" shapeRendering="crispEdges">
        <rect x="4" y="0" width="1" height="2" />
        <rect x="3" y="2" width="3" height="1" />
        <rect x="0" y="3" width="9" height="1" />
        <rect x="1" y="4" width="7" height="1" />
        <rect x="2" y="5" width="5" height="1" />
        <rect x="2" y="6" width="2" height="1" />
        <rect x="5" y="6" width="2" height="1" />
        <rect x="1" y="7" width="2" height="1" />
        <rect x="6" y="7" width="2" height="1" />
      </svg>
    </span>
  );
}
