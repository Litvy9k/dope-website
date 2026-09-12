import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './Layout.css';
import SiteNav from './nav/SiteNav';
import bgImage from '/image/bg.jpg';
import CRTEffect from 'vault66-crt-effect';
import "vault66-crt-effect/dist/vault66-crt-effect.css";
import SetupPanel from './SetupPanel';
import { UIContext } from './UIContext';
import { warmImages } from '../warmImages';
import { chainCursor } from '../highlight/chain';

function Layout({ children }) {
  const [showSetup, setShowSetup] = useState(false);
  const [scanlines, setScanlines] = useState(true);
  const [sweep, setSweep] = useState(true);
  const [flicker, setFlicker] = useState(true);
  const [useFont, setFont] = useState(true);
  const [chinese, setChinese] = useState(false);

  // 面板要锚在这个按钮上方，关闭时也要把焦点还给它
  const setupTriggerRef = useRef(null);

  const openSetup = useCallback(() => setShowSetup(true), []);
  const closeSetup = useCallback(() => setShowSetup(false), []);
  const toggleSetup = useCallback(() => setShowSetup((open) => !open), []);

  // 正文里的高亮悬浮时，在底栏 SETUP 按钮上方冒一个箭头指着它。
  // 只是指路，不代替按钮本身
  const [setupHint, setSetupHint] = useState(false);
  const showSetupHint = useCallback(() => setSetupHint(true), []);
  const hideSetupHint = useCallback(() => setSetupHint(false), []);

  /*
   * 悬浮 [link] 时，底栏那条命令行回显目标地址 —— 浏览器左下角就是这么做的，
   * 而这个站本来就长得像终端，回显比在正文上方弹个框自然得多。
   *
   * 走的是和 setupHint 完全一样的管道：正文那边只在 actions.js 里调一下，
   * 组件不用知道有这回事。存地址而不是布尔，底栏要把它印出来。
   */
  const [linkHint, setLinkHint] = useState(null);
  const showLinkHint = useCallback((href) => setLinkHint(href ?? null), []);
  const hideLinkHint = useCallback(() => setLinkHint(null), []);

  /*
   * 锁链光标。图形在 highlight/chain.js，这里把生成好的 cursor 值挂到根元素
   * 的自定义属性上，样式表读 var(--chain-cursor) —— CSS 没法 import JS，而
   * 把那串 data URI 在 highlight.css 里再写一遍就等于两份坐标，迟早漂。
   *
   * 挂根元素上的先例是 nav/SiteNav.jsx 的 --nav-height，同样是"值只有 JS
   * 算得出来、用它的却是 CSS"。只跑一次：图形是静态的。
   */
  useEffect(() => {
    document.documentElement.style.setProperty('--chain-cursor', chainCursor());
  }, []);

  /*
   * 设置面板里那三个开关的贴图，提前拉进缓存。
   *
   * 面板是条件渲染的（下面的 showSetup），CSS 背景图要等用它的元素真的
   * 存在才会被请求 —— 实测开面板前 0 个请求，点开的瞬间三张一起下载，
   * 于是开关会空一下才画出来。三张加起来 6.7KB，预热的代价可以忽略。
   *
   * 路径写在这里而不是从样式表里读：真要同步就是两处一起改。
   * pixelated_switch.css 那边留了反向指路的注释。
   */
  useEffect(
    () =>
      warmImages([
        '/image/switch_bg_off.png',
        '/image/switch_bg_on.png',
        '/image/switch_slider.png',
      ]),
    []
  );

  // F10 开关面板，和底栏上写的 [F10] 对得上。Esc 由面板自己处理，
  // 因为它还要负责把焦点送回按钮
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'F10') return;
      e.preventDefault();
      toggleSetup();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleSetup]);

  const ui = useMemo(
    () => ({
      showSetup,
      openSetup,
      closeSetup,
      toggleSetup,
      setupTriggerRef,
      setupHint,
      showSetupHint,
      hideSetupHint,
      linkHint,
      showLinkHint,
      hideLinkHint,
      lang: chinese ? 'zh' : 'en',
    }),
    [
      showSetup, openSetup, closeSetup, toggleSetup,
      setupHint, showSetupHint, hideSetupHint,
      linkHint, showLinkHint, hideLinkHint, chinese,
    ]
  );

  return (
    <UIContext.Provider value={ui}>
    {/* enableFlicker 一直是 false：包的实现是给 .crt-effect-wrapper 加
        opacity 动画，而那个 wrapper 裹着整站，透出来的是根元素的底色 ——
        浅色模式下会闪白。闪烁改由 .crt-flicker 那层负责，见 Layout.css */}
    <CRTEffect
      enabled={true}
      enableScanlines={scanlines}
      enableSweep={sweep}
      theme="custom"
      enableFlicker={false}
      scanlineOrientation={"horizontal"}
      sweepDuration={5}
      sweepThickness={40}
      sweepStyle="soft"
      glowColor="rgba(0,255,128,0.4)"
      enableGlow={true}
      enableEdgeGlow={true}
      edgeGlowColor="rgba(0,255,128,0.3)"
      edgeGlowSize={30}
      scanlineColor="rgba(0, 50, 0, 0.3)" >

      {/* 屏幕闪烁：自己画的一层，见 Layout.css */}
      {flicker && <div className="crt-flicker" aria-hidden="true" />}

      <SiteNav />

      {showSetup && (
        <SetupPanel
          onClose={closeSetup}
          triggerRef={setupTriggerRef}
          lang={chinese ? 'zh' : 'en'}
          scanlines={scanlines}
          setScanlines={setScanlines}
          sweep={sweep}
          setSweep={setSweep}
          flicker={flicker}
          setFlicker={setFlicker}
          useFont={useFont}
          setFont={setFont}
          chinese={chinese}
          setChinese={setChinese}
        />
      )}

      {/* 只把图交给 CSS，其余全在 Layout.css 里 ——
          真正画背景的是 .bg::before 那层固定层，不是这个元素本身 */}
      <div className="bg" style={{ '--bg-image': `url(${bgImage})` }}>
        {/* crt-flicker-on：正文里跟着"屏幕闪烁"开关走的效果挂在它下面，
            目前是标题霓虹灯管的明灭（content/Markdown.css）。上面那层
            .crt-flicker 是整屏的闪，这个类是给正文内部用的 —— 同一个开关，
            两处表现，嫌闪的人只需要关一次 */}
        <main
          className={`main-content ${useFont ? 'use-pixel-font' : 'use-normal-font'} ${
            flicker ? 'crt-flicker-on' : ''
          }`}
        >
          {children}
        </main>
      </div>
    </CRTEffect>
    </UIContext.Provider>
  );
}

export default Layout;
