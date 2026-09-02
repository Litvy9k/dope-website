/**
 * 站点栏目树。路由、导航、面包屑都从这里读，加栏目只改这一处。
 *
 *   slug     URL 用，永远保持 ASCII（中文 URL 分享和复制都麻烦）
 *   label    显示用，跟着语言切。中文路径在真实终端里很常见，不别扭
 *   children 有就是二级菜单，没有就是叶子
 *
 * 主页不在这个表里 —— 它就是根目录 ~/，导航里单独渲染。
 * 命令和语法（ls / cd / $ / ~ / ../）不进 i18n，那是语法不是英语。
 */
export const sections = [
  {
    slug: 'abt-me',
    label: { en: 'abt-me', zh: '关于我' },
  },
  {
    slug: 'review',
    label: { en: 'review', zh: '评论' },
    // 列表样式。子栏目继承，不写就是简单列表
    layout: 'cards',
    children: [
      { slug: 'anime', label: { en: 'anime', zh: '动画' } },
      { slug: 'books', label: { en: 'books', zh: '书籍' } },
      { slug: 'games', label: { en: 'games', zh: '游戏' } },
      { slug: 'films', label: { en: 'films', zh: '电影' } },
    ],
  },
  {
    slug: 'blog-post',
    label: { en: 'blog-post', zh: '博文' },
  },
];

export function labelOf(node, lang) {
  return node.label[lang] ?? node.label.en;
}

/**
 * '/review/films' → [review 节点, films 节点]
 * 认不出来的段落就停下，所以乱输 URL 不会炸。
 */
export function trailOf(pathname) {
  const trail = [];
  let level = sections;

  for (const segment of pathname.split('/').filter(Boolean)) {
    const node = level?.find((n) => n.slug === segment);
    if (!node) break;
    trail.push(node);
    level = node.children;
  }
  return trail;
}

/** 列表样式取路径上最近一个写了 layout 的节点，所以子栏目会继承父栏目的 */
export function layoutOf(trail) {
  for (let i = trail.length - 1; i >= 0; i -= 1) {
    if (trail[i].layout) return trail[i].layout;
  }
  return 'list';
}

/** 显示给人看的路径：~/评论/电影 */
export function pathLabel(trail, lang) {
  if (!trail.length) return '~';
  return `~/${trail.map((n) => labelOf(n, lang)).join('/')}`;
}
