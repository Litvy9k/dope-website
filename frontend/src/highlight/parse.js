/**
 * 论坛风格的 [标记] 解析。
 *
 *   [tooltip=1996 年，王家卫]重庆森林[/tooltip]     简写值：一直取到 ]，中文标点空格都能直接写
 *   [link href="https://..." tip="点开看看"]某处[/link]   具名参数：值带空格就得加引号
 *   [settings]settings tab[/settings]              不带参数
 *
 * 简写值和具名参数二选一，不能混用 —— 需要两个以上参数就用具名的。
 * 没配对的标记会原样当普通文字显示，不会把整页搞崩。
 */

// \1 反向引用保证开闭标记同名；内容非贪婪，避免吃掉后面的标记
const TAG = /\[([a-zA-Z][\w-]*)([^\]]*)\]([\s\S]*?)\[\/\1\]/g;
const ATTR = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))/g;

function parseParams(raw) {
  const s = raw.trim();
  if (!s) return { value: null, attrs: {} };

  // [名字=值]
  if (s.startsWith('=')) return { value: s.slice(1).trim(), attrs: {} };

  // [名字 key="值" key2="值"]
  const attrs = {};
  ATTR.lastIndex = 0;
  let m;
  while ((m = ATTR.exec(s)) !== null) {
    attrs[m[1]] = m[2] ?? m[3] ?? m[4];
  }
  return { value: null, attrs };
}

/**
 * 把带标记的字符串拆成一串节点。
 * 普通文字是 string，标记是 { action, value, attrs, children }。
 */
export function parseMarkup(text) {
  const nodes = [];
  let last = 0;
  let m;

  TAG.lastIndex = 0;
  while ((m = TAG.exec(text)) !== null) {
    const [full, action, raw, children] = m;
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push({ action, children, ...parseParams(raw) });
    last = m.index + full.length;
  }
  if (last < text.length) nodes.push(text.slice(last));

  return nodes;
}
