/**
 * 站点栏目树。路由、导航、面包屑都从这里读，加栏目只改这一处。
 *
 *   slug     URL 用，永远保持 ASCII（中文 URL 分享和复制都麻烦）
 *   label    显示用，跟着语言切。中文路径在真实终端里很常见，不别扭
 *   children 有就是二级菜单，没有就是叶子
 *
 * 注意命令和语法（ls / cd / $ / ~ / ../）不进 i18n —— 那是语法不是英语。
 */
export const sections = [
  {
    slug: 'works',
    label: { en: 'works', zh: '作品' },
    children: [
      { slug: 'games', label: { en: 'games', zh: '游戏' } },
      { slug: 'films', label: { en: 'films', zh: '电影' } },
      { slug: 'books', label: { en: 'books', zh: '书籍' } },
    ],
  },
  {
    slug: 'log',
    label: { en: 'log', zh: '日志' },
    children: [
      { slug: '2026', label: { en: '2026', zh: '2026' } },
      { slug: '2025', label: { en: '2025', zh: '2025' } },
    ],
  },
  {
    slug: 'about',
    label: { en: 'about', zh: '关于' },
  },
];

export function labelOf(node, lang) {
  return node.label[lang] ?? node.label.en;
}

/**
 * '/works/games' → [works 节点, games 节点]
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

/** 显示给人看的路径：~/作品/游戏 */
export function pathLabel(trail, lang) {
  if (!trail.length) return '~';
  return `~/${trail.map((n) => labelOf(n, lang)).join('/')}`;
}
