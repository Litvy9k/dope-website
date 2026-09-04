/**
 * 把思源宋体子集化成只含站点真正用到的那几百个字。
 *
 * 完整的 SourceHanSerifSC-SemiBold.otf 有 22.8MB / 六万多字形，
 * 切到中文并关掉点阵字体时浏览器要整包下载。但这个站是纯静态的，
 * 所有会显示的文字都在仓库里躺着，构建时扫一遍就能知道到底用了哪些字。
 *
 * 所以源字体放在 font-source/（不进 public/，否则 Vite 会原样拷进 dist），
 * 产物写到 public/font/ 让 CSS 引用。dev 和 build 前都会自动跑一次
 * （package.json 的 predev / prebuild），加文章不用记得手动重新生成。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SOURCE = path.join(root, 'font-source/SourceHanSerifSC-SemiBold.otf');
const OUTPUT = path.join(root, 'public/font/SourceHanSerifSC-SemiBold.subset.woff2');

/** 扫这些地方。文案散在 content/ 的正文和 src/ 的 i18n、sections 里 */
const SCAN_DIRS = ['content', 'src'];
const SCAN_FILES = [
  'index.html',
  // 游戏子模块。它的界面文字全部走 i18n.js（其余文件里的中文都是注释），
  // 而画布那部分用的是它自己的等宽字体、轮不到这里的中文字体 ——
  // 但存档那几个按钮是跟着站点样式走的，那几个字得在子集里，
  // 否则只有那一小块会掉到系统字体上，页面照常能用，不专门看发现不了。
  // 只扫这一个文件而不是整个 game/：其余全是注释，白白多带一百多个字形
  'vendor/temu-thea/src/game/i18n.js',
];
const SCAN_EXT = /\.(md|jsx?|tsx?|css|html)$/;

/**
 * 保底字符：就算仓库里一个都没出现也带上。
 * 这个字体是 --font-normal-slim 的兜底项，拉丁字形轮不到它上场，
 * 但标点会 —— Oswald 没有全角标点，破折号省略号这些都会落到中文字体。
 */
function baseline() {
  const ranges = [
    [0x20, 0x7e], // ASCII 可打印
    [0x2010, 0x2027], // 连字符、各种破折号、引号、省略号
    [0x3000, 0x303f], // CJK 标点：。、《》「」等
    [0xff01, 0xff65], // 全角形式
  ];
  let out = '';
  for (const [lo, hi] of ranges) {
    for (let cp = lo; cp <= hi; cp += 1) out += String.fromCodePoint(cp);
  }

  /*
   * 游戏 HUD 里的几个符号。它们写在 JSX 里而不是 i18n.js 里，扫不到；
   * 而站点的四个字体一个都没有这几个字形（查过 cmap），漏掉的话它们会
   * 逐字回退到系统字体 —— 一行字里混进两个不一样的符号，能看出别扭，
   * 但不会报任何错。地图上的 ♣ ∩ ▲ ≈ ⌂ 不在这里：那些画在 canvas 上，
   * 用的是 draw.ts 自己的等宽字体，跟这套字体无关。
   */
  out += '✦◆❙×';

  return out;
}

function collect(target, sink) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target)) collect(path.join(target, entry), sink);
  } else if (SCAN_EXT.test(target)) {
    sink.push(fs.readFileSync(target, 'utf8'));
    newest = Math.max(newest, stat.mtimeMs);
  }
}

/** 扫到的最新一次改动时间，用来判断已有产物还算不算数 */
let newest = 0;

function charset() {
  const chunks = [baseline()];
  for (const dir of [...SCAN_DIRS, ...SCAN_FILES]) {
    const target = path.join(root, dir);
    if (fs.existsSync(target)) collect(target, chunks);
  }
  // Array.from 按码位切分，别用 split('')，那会把 emoji 之类的代理对拆坏
  return [...new Set(Array.from(chunks.join('')))]
    .filter((c) => !/\s/.test(c))
    .sort()
    .join('');
}

const chars = charset();

// 光是读进这个 23MB 的字体就要好几秒，而 predev 每次 npm run dev 都会跑。
// 产物比所有输入都新就说明没什么可做的了。
const fresh =
  fs.existsSync(OUTPUT) &&
  fs.statSync(OUTPUT).mtimeMs > Math.max(newest, fs.statSync(SOURCE).mtimeMs);
if (fresh) {
  console.log('字体子集已是最新，跳过');
  process.exit(0);
}

const source = fs.readFileSync(SOURCE);
const subset = await subsetFont(source, chars, { targetFormat: 'woff2' });

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, subset);

const mb = (n) => `${(n / 1024 / 1024).toFixed(2)}MB`;
console.log(
  `字体子集化：${Array.from(chars).length} 个字符，` +
    `${mb(source.length)} → ${mb(subset.length)}（${(
      (1 - subset.length / source.length) * 100
    ).toFixed(1)}% 减少）`,
);
