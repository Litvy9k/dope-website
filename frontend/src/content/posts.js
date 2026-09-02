import { load as parseYaml } from 'js-yaml';

/**
 * content/ 下的所有文章。构建时全部读进来，不需要后端。
 *
 * 目录结构直接就是 URL：
 *   content/review/films/chungking-express.md  →  /review/films/chungking-express
 *   content/blog-post/hello.md                 →  /blog-post/hello
 *
 * 每篇的格式见 content/README.md。
 */
const files = import.meta.glob('/content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const LANG_MARK = /<!--\s*(en|zh)\s*-->/gi;

/** 正文按 <!-- en --> / <!-- zh --> 切成两份。没有标记就两边共用同一份 */
function splitLanguages(body) {
  const marks = [...body.matchAll(LANG_MARK)];
  if (!marks.length) {
    const shared = body.trim();
    return { en: shared, zh: shared };
  }

  const parts = {};
  marks.forEach((mark, i) => {
    const start = mark.index + mark[0].length;
    const end = i + 1 < marks.length ? marks[i + 1].index : body.length;
    parts[mark[1].toLowerCase()] = body.slice(start, end).trim();
  });
  return parts;
}

/**
 * 列表卡片上那两行简介：取正文第一段，把标记和 Markdown 语法剥掉。
 * 截断交给 CSS 的 line-clamp，这样不同宽度下断在哪都合适。
 */
function excerptOf(body) {
  const paragraph = body
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    // 跳过引用、标题、列表，找第一段正文
    .find((s) => s && !/^[>#\-*\d]/.test(s));

  if (!paragraph) return '';

  return paragraph
    .replace(/\[([a-zA-Z][\w-]*)[^\]]*\]([\s\S]*?)\[\/\1\]/g, '$2') // [标记]内容[/标记]
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // markdown 链接
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parse(path, raw) {
  const match = raw.match(FRONTMATTER);
  const meta = match ? parseYaml(match[1]) ?? {} : {};
  const body = match ? raw.slice(match[0].length) : raw;

  // /content/review/films/xxx.md → /review/films/xxx
  const route = path.replace(/^\/content/, '').replace(/\.md$/, '');
  const bodies = splitLanguages(body);

  return {
    ...meta,
    route,
    slug: route.split('/').pop(),
    // 所在栏目，用来做列表页：/review/films/xxx → /review/films
    section: route.slice(0, route.lastIndexOf('/')),
    body: bodies,
    excerpt: {
      en: excerptOf(bodies.en ?? ''),
      zh: excerptOf(bodies.zh ?? ''),
    },
  };
}

export const posts = Object.entries(files)
  .map(([path, raw]) => parse(path, raw))
  // 新的在前。没写日期的排到最后
  .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));

export function getPost(pathname) {
  return posts.find((p) => p.route === pathname);
}

/** 某个栏目下的文章。深层的也算，这样 /review 能看到全部评论 */
export function postsUnder(pathname) {
  const prefix = pathname === '/' ? '/' : `${pathname}/`;
  return posts.filter((p) => p.route.startsWith(prefix));
}

/**
 * 拆成"置顶那篇"和"其余"。
 *
 * frontmatter 写了 featured: true 就用它，没写就取评分最高的那篇 ——
 * 这样新栏目不用先标一篇也能有置顶。
 *
 * 两种并列的情况都有确定规则，不靠数组顺序碰运气：
 *   标了多篇  → 最新的那篇（entries 已按日期倒序）
 *   评分打平  → 同样取最新的
 */
export function splitFeatured(entries) {
  if (entries.length === 0) return { featured: null, rest: [] };

  const marked = entries.filter((p) => p.featured);
  const pool = marked.length ? marked : entries;

  // entries 是日期倒序，严格大于才替换，所以打平时留在前面的（更新的）那篇
  const featured = pool.reduce((best, p) =>
    (p.rating ?? -1) > (best.rating ?? -1) ? p : best
  );

  return { featured, rest: entries.filter((p) => p !== featured) };
}

/** 标题、简介这类字段写成 { en, zh }，取当前语言那份 */
export function pick(field, lang) {
  if (field == null) return '';
  if (typeof field === 'string') return field;
  return field[lang] ?? field.en ?? field.zh ?? '';
}

/**
 * tags 这种"一串词"的字段。规则和 pick 一样，只是两边各是一个数组：
 *
 *   tags: [meta]                    两种语言共用这一份
 *   tags: { en: [...], zh: [...] }  各写各的
 *
 * 直接写一个数组就是两边一样 —— 和正文里不写 <!-- en --> 标记就共用同一份
 * 是同一个约定，省得为 1990s 这种两边本来就一样的词写两遍。
 */
export function pickList(field, lang) {
  if (field == null) return [];
  if (Array.isArray(field)) return field;
  return field[lang] ?? field.en ?? field.zh ?? [];
}
