import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './Layout.css';
import SiteNav from './nav/SiteNav';
import bgImage from '/image/bg.jpg';
import CRTEffect from 'vault66-crt-effect';
import "vault66-crt-effect/dist/vault66-crt-effect.css";
import SetupPanel from './SetupPanel';
import { UIContext } from './UIContext';
import { warmImages } from '../warmImages';

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
      lang: chinese ? 'zh' : 'en',
    }),
    [
      showSetup, openSetup, closeSetup, toggleSetup,
      setupHint, showSetupHint, hideSetupHint, chinese,
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
        <main className={`main-content ${useFont ? 'use-pixel-font' : 'use-normal-font'}`}>
          {children}
        </main>
      </div>
    </CRTEffect>
    </UIContext.Provider>
  );
}

export default Layout;
