import { useEffect, useRef } from 'react';
import ShellNav from './ShellNav';
import './site-nav.css';

/**
 * 导航条固定在屏幕底部（真实终端的提示符也在最后一行）。
 * 正文和设置面板都得给它让位，高度会随二级菜单出现和窄屏换行而变，
 * 所以量出来写进 --nav-height，不靠写死的数字。
 */
function SiteNav() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const publish = () =>
      document.documentElement.style.setProperty(
        '--nav-height',
        `${el.offsetHeight}px`
      );

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <nav ref={ref} className="site-nav" aria-label="Site navigation">
      <ShellNav />
    </nav>
  );
}

export default SiteNav;
