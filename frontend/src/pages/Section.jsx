import { Link } from 'react-router-dom';
import '../components/Layout.css';
import './Section.css';
import { useUI } from '../components/UIContext';
import { t } from '../i18n';
import Rating from '../components/Rating';
import PostCard from '../components/PostCard';
import { labelOf, layoutOf } from '../components/nav/sections';
import { pick, postsUnder, splitFeatured } from '../content/posts';

/** 叶子栏目：置顶一张横跨整行，其余进双栏 */
function LeafCards({ entries, lang }) {
  const { featured, rest } = splitFeatured(entries);

  return (
    <div className="cards">
      {featured && (
        <div className="card-featured">
          <PostCard post={featured} lang={lang} featured />
        </div>
      )}
      {rest.length > 0 && (
        <div className="card-grid">
          {rest.map((post) => (
            <PostCard key={post.route} post={post} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 汇总栏目（比如 /review）：每个子栏目各自的置顶篇加颗星排到最前面，
 * 但不做成横幅 —— 跨媒介评不出唯一的"最推荐"，几个并列才是实情。
 */
function AggregateCards({ node, path, entries, lang }) {
  const picks = new Set();
  node.children.forEach((child) => {
    const sub = entries.filter((p) => p.route.startsWith(`${path}/${child.slug}/`));
    if (sub.length) picks.add(splitFeatured(sub).featured);
  });

  // sort 是稳定的，所以加星的排到前面之后，各组内部仍是原来的日期倒序
  const ordered = [...entries].sort(
    (a, b) => (picks.has(b) ? 1 : 0) - (picks.has(a) ? 1 : 0)
  );

  return (
    <div className="cards">
      <div className="card-grid">
        {ordered.map((post) => (
          <PostCard key={post.route} post={post} lang={lang} starred={picks.has(post)} />
        ))}
      </div>
    </div>
  );
}

/** 栏目页：列出这个目录下的文章。子栏目在底栏导航里，这里不重复 */
export default function Section({ node, trail }) {
  const { lang } = useUI();
  const path = `/${trail.map((n) => n.slug).join('/')}`;
  const entries = postsUnder(path);

  return (
    <>
      <h1>{labelOf(node, lang)}</h1>

      {entries.length === 0 ? (
        <p className="section-empty">
          {lang === 'zh' ? '这里还没有内容。' : 'Nothing here yet.'}
        </p>
      ) : layoutOf(trail) === 'cards' ? (
        node.children ? (
          <AggregateCards node={node} path={path} entries={entries} lang={lang} />
        ) : (
          <LeafCards entries={entries} lang={lang} />
        )
      ) : (
        <ul className="entry-list">
          {entries.map((post) => (
            <li key={post.route} className="entry">
              <Link to={post.route} className="entry-link">
                <span className="entry-title">{pick(post.title, lang)}</span>
                {post.original && <span className="entry-original">{post.original}</span>}
              </Link>
              <span className="entry-meta">
                {post.date && <span className="entry-date">{post.date}</span>}
                {post.year && <span>{post.year}</span>}
                {post.rating != null && <Rating value={post.rating} />}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function NotFound({ pathname, lang }) {
  return (
    <>
      <h1>404</h1>
      <h2>{`bash: cd: ${pathname}: ${t('noSuchDir', lang)}`}</h2>
    </>
  );
}
