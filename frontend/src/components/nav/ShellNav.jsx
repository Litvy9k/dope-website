import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useUI } from '../UIContext';
import { t } from '../../i18n';
import { sections, labelOf, trailOf, pathLabel } from './sections';
import './ShellNav.css';

function ShellNav() {
  const { pathname } = useLocation();
  const { lang, showSetup, toggleSetup, setupTriggerRef, setupHint } = useUI();

  // 箭头要能播退场动画，所以一直挂着靠 class 切。
  // 空字符串是"还没出现过"，免得首次渲染就播一遍退场
  const [hintPhase, setHintPhase] = useState('');
  const prevHint = useRef(setupHint);
  useEffect(() => {
    if (setupHint === prevHint.current) return;
    prevHint.current = setupHint;
    setHintPhase(setupHint ? 'is-in' : 'is-out');
  }, [setupHint]);

  const trail = trailOf(pathname);
  const [activeTop, activeSub] = trail;

  // 悬浮顶层条目就预览它的子级，移开恢复当前所在分支
  const [hovered, setHovered] = useState(null);
  const focused = hovered ?? activeTop ?? null;
  const children = focused?.children ?? [];

  // 当前所在目录的条目。根目录列的就是顶层栏目
  const here = trail[trail.length - 1];
  const entries = here ? here.children ?? [] : sections;

  const displayPath = pathLabel(trail, lang);
  const command = `cd ${displayPath}`;

  // 存"打到第几个字"而不是打出来的字符串，这样切语言时命令会跟着路径
  // 一起变成中文，不会出现提示符是中文、回显还是英文的错位。
  // null 表示静止状态，显示 ls。
  const [revealed, setRevealed] = useState(null);
  const typed = revealed === null ? 'ls' : command.slice(0, revealed);

  const lengthRef = useRef(command.length);
  lengthRef.current = command.length;
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    let i = 0;
    setRevealed(0);
    const id = setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= lengthRef.current) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [pathname]);

  return (
    // 两层都是 column-reverse：DOM 顺序照着阅读逻辑写（提示符 → 顶层 → 子级），
    // 视觉上翻过来变成子级在上、提示符贴底 —— 真实终端就是提示符在最后一行。
    // 好处是 Tab 键顺序仍然是先顶层后子级。
    <div className="sh-shell">
      <div className="sh-line">
        <span className="sh-user">guest@somewhere</span>
        <span className="sh-punct">:</span>
        {/* 提示符里的路径本来就是面包屑，每一段可点就是现成的返回入口 */}
        <span className="sh-path">
          <Link to="/" className="sh-seg">~</Link>
          {trail.map((node, i) => (
            <Fragment key={node.slug}>
              <span className="sh-slash">/</span>
              <Link
                to={`/${trail.slice(0, i + 1).map((n) => n.slug).join('/')}`}
                className="sh-seg"
              >
                {labelOf(node, lang)}
              </Link>
            </Fragment>
          ))}
        </span>
        <span className="sh-punct">$</span>
        <span className="sh-cmd">{typed}</span>
        <span className="sh-cursor" aria-hidden="true" />

        <span className="sh-spacer" />

        {/* Norton Commander 底部就是一排功能键，设置从这里进 */}
        <span className="sh-fkey-slot">
          <span className={`setup-arrow ${hintPhase}`} aria-hidden="true">
            {/* 一格一格拼出来的箭头，保证是方的 */}
            <svg viewBox="0 0 9 12" shapeRendering="crispEdges">
              <rect x="3" y="0" width="3" height="7" />
              <rect x="0" y="7" width="9" height="1" />
              <rect x="1" y="8" width="7" height="1" />
              <rect x="2" y="9" width="5" height="1" />
              <rect x="3" y="10" width="3" height="1" />
              <rect x="4" y="11" width="1" height="1" />
            </svg>
          </span>

          <button
            ref={setupTriggerRef}
            className={`sh-fkey ${showSetup ? 'is-on' : ''}`}
            onClick={toggleSetup}
            aria-expanded={showSetup}
          >
            <span className="sh-fkey-key">[F10]</span> {t('setup', lang)}
          </button>
        </span>

        {/* ls 本来就会报当前目录有多少条目。等栏目里真有内容了这个数字才有意义 */}
        <span className="sh-total">
          {lang === 'zh' ? `总计 ${entries.length}` : `total ${entries.length}`}
        </span>
      </div>

      {/* 两行套在同一个容器里，鼠标从顶层挪到子级不会触发 leave，
          否则预览出来的子菜单还没碰到就消失了 */}
      <div className="sh-menu" onMouseLeave={() => setHovered(null)}>
        <nav className="sh-nav">
          <NavLink to="/" end className={({ isActive }) => `sh-entry ${isActive ? 'is-on' : ''}`}>
            ~/
          </NavLink>

          {sections.map((node) => (
            <NavLink
              key={node.slug}
              to={`/${node.slug}`}
              onMouseEnter={() => setHovered(node)}
              className={`sh-entry ${node === activeTop ? 'is-on' : ''} ${
                node === focused && node !== activeTop ? 'is-peeking' : ''
              }`}
            >
              ./{labelOf(node, lang)}
            </NavLink>
          ))}
        </nav>

        {children.length > 0 && (
          <nav className={`sh-subnav ${hovered && hovered !== activeTop ? 'is-preview' : ''}`}>
            <span className="sh-branch" aria-hidden="true">└─</span>
            {children.map((child) => (
              <NavLink
                key={child.slug}
                to={`/${focused.slug}/${child.slug}`}
                className={`sh-entry ${child === activeSub ? 'is-on' : ''}`}
              >
                ./{labelOf(child, lang)}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

export default ShellNav;
