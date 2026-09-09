/**
 * 把几张图悄悄拉进浏览器缓存，不渲染任何东西。
 *
 * 用在"这张图迟早要显示，但那一刻才开始下载就会看到卡顿"的地方：
 * tooltip 的图（节点只在激活时才挂上去）、设置面板里开关的贴图
 * （面板是条件渲染的，CSS 背景图要等元素存在才拉）。
 *
 * 趁空闲做，别跟首屏的字体和背景图抢带宽。requestIdleCallback 一定要给
 * timeout：页面一直不空闲、或者标签页在后台时，回调可能永远不触发。
 *
 * 返回一个清理函数，在 effect 里直接 return 它。
 */
export function warmImages(urls) {
  const list = urls.filter(Boolean);
  if (!list.length) return () => {};

  let cancelled = false;
  const warm = () => {
    if (cancelled) return;
    list.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  };

  const ric = window.requestIdleCallback;
  const id = ric ? ric(warm, { timeout: 2000 }) : setTimeout(warm, 1200);

  return () => {
    cancelled = true;
    if (ric) window.cancelIdleCallback?.(id);
    else clearTimeout(id);
  };
}
