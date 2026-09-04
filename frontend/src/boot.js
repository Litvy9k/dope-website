/**
 * 开机自检画面的收尾：把 index.html 里那几行标上 OK，全好了再揭开。
 *
 * 画面本身（结构 + 样式 + 8 秒兜底）内联在 index.html 里，因为它必须在这个
 * bundle 下完之前就能画出来。这里只负责观察，不负责发起下载 —— 字体和 bg.jpg
 * 都由 index.html 的 <link rel="preload"> 在解析时就开始拉了。
 *
 * 每一行对应一件真实发生的事，不是定时器凑出来的假进度。
 */

const el = () => document.getElementById('boot');

/** 把某一行标成完成 */
function mark(step) {
  const row = el()?.querySelector(`[data-step="${step}"]`);
  if (!row) return;
  row.dataset.ok = '';
  row.querySelector('.boot-mark').textContent = 'OK';
}

/** n 毫秒后一定 resolve 的兜底，用来跟可能永远不回来的 promise 竞速 */
const deadline = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 等 bg.jpg。理想情况是等到解码完而不只是下载完 —— 只等 load 的话图片还没
 * 进合成器，揭开的瞬间背景仍可能是空的。
 *
 * 但 decode() 不能直接 await：页面不在前台时浏览器会推迟解码，这个 promise
 * 就永远不 resolve。实测隐藏的标签页里 load 在 6ms 就触发，decode() 等 3 秒
 * 依然没有回音。真实用户在后台标签页打开站点会撞上同一件事，然后开机画面
 * 一直挂到 8 秒兜底才揭开 —— 页面明明早就好了。
 *
 * 所以跟一个短超时竞速：解码得成就赚到，解码不动就按 load 算数。reject
 * （格式问题之类）同样放行，不该为它卡住整个站点。
 */
function backgroundReady() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = resolve;
    img.onload = () => {
      if (!img.decode) return resolve();
      return Promise.race([img.decode().catch(() => {}), deadline(400)]).then(resolve);
    };
    img.src = '/image/bg.jpg';
  });
}

/**
 * 字体。document.fonts.ready 在所有待处理的字体加载结束后 resolve；
 * 老浏览器没有 FontFaceSet 就直接放行，不值得为此卡住。
 *
 * 同样给个上限。子集之后最大的一个也才 53KB，等超过 3 秒就说明网络出了
 * 别的问题，那时揭开让人看到站点，比继续盯着自检画面强 —— 反正
 * font-display: block 的阻塞期本来也是 3 秒。
 */
function fontsReady() {
  if (!document.fonts) return Promise.resolve();
  return Promise.race([document.fonts.ready, deadline(3000)]);
}

/** React 挂完后由 main.jsx 调，是这里唯一从外面推进来的一步 */
export async function bootComplete() {
  const node = el();
  if (!node) return;

  // 这两步在能跑到这里的时候必然已经成立：模块执行意味着 bundle 和它的
  // 样式表都到位了
  mark('rom');
  mark('css');
  mark('runtime');

  await Promise.all([
    fontsReady().then(() => mark('font')),
    backgroundReady().then(() => mark('bg')),
  ]);

  clearTimeout(window.__bootFallback);
  node.dataset.ready = '';

  // 让 READY 那行真的被看见一眼再淡出，否则全都命中缓存时这一帧根本不存在。
  // 时长和 index.html 里 #boot 的 transition 对齐
  await new Promise((r) => setTimeout(r, 260));
  node.dataset.done = '';

  // 淡出结束就摘掉。不能只听 transitionend —— prefers-reduced-motion 下
  // #boot 的 transition 是 none，那个事件永远不会来，节点会以 opacity:0
  // 挂在那儿（能用，因为它同时是 pointer-events:none，但不该留着）
  const remove = () => node.remove();
  node.addEventListener('transitionend', remove, { once: true });
  setTimeout(remove, 600);
}
