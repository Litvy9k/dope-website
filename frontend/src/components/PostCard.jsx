import { Link } from 'react-router-dom';
import Rating from './Rating';
import PixelStar from './PixelStar';
import { pick } from '../content/posts';
import './PostCard.css';

function Cover({ src, alt }) {
  if (!src) {
    // 还没有封面图。留白不如明说，顺便也是这个主题该有的样子
    return (
      <div className="card-cover is-empty" aria-hidden="true">
        <span>NO<br />SIGNAL</span>
      </div>
    );
  }
  return <img className="card-cover" src={src} alt={alt} loading="lazy" />;
}

/**
 * 列表卡片。featured 的那张横跨整行，其余进双栏。
 * 置顶的不写"我最爱"之类的标签 —— 尺寸和边框已经说明问题了，角上一个 ★ 足够。
 */
/**
 * @param featured 横幅式大卡，叶子栏目的置顶篇用
 * @param starred  只加星不改版式，汇总页里各媒介的置顶篇用
 */
export default function PostCard({ post, lang, featured = false, starred = false }) {
  const title = pick(post.title, lang);

  return (
    <Link
      to={post.route}
      className={`post-card ${featured ? 'is-featured' : ''}`}
    >
      <Cover src={post.cover} alt={title} />

      {/* 星星本身在 PixelStar 里（GitHub 页的置顶仓库卡片用的是同一颗），这里只管摆在哪 */}
      {(featured || starred) && <PixelStar className="card-star" />}

      <div className="card-body">
        {/* 原名和年份跟在标题后面同一行，各自保持原来的字号 */}
        <div className="card-head">
          <h3 className="card-title">{title}</h3>
          {(post.original || post.year) && (
            <span className="card-sub">
              {post.original && <span className="card-original">{post.original}</span>}
              {post.year && <span>{post.year}</span>}
            </span>
          )}
        </div>

        {post.rating != null && (
          <div className="card-rating"><Rating value={post.rating} /></div>
        )}

        {/* 一句话总评。独立字段，不从正文提取，所以和下面的摘录是两回事。
            本来想用斜体区分，但点阵字体没有斜体face，浏览器也不给它做
            倾斜合成 —— font-style 在这儿完全没效果，所以改用引号。 */}
        {post.verdict && (
          <p className="card-verdict">
            {/* 点阵字体的引号贴字太紧，加空格隔开。用不换行空格，
                普通空格在元素边界会被折叠掉 */}
            {lang === 'zh' ? '「 ' : '“ '}
            {pick(post.verdict, lang)}
            {lang === 'zh' ? ' 」' : ' ”'}
          </p>
        )}

        <p className="card-excerpt">{pick(post.excerpt, lang)}</p>
      </div>
    </Link>
  );
}
