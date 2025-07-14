import React, { useState } from 'react';
import './Layout.css';
import Header from './Header';
import bgImage from '/image/bg.jpg';
import CRTEffect from 'vault66-crt-effect';
import "vault66-crt-effect/dist/vault66-crt-effect.css";
import EFXSettings from './setting_panel';

function Layout({ children }) {
  const [showTray, setShowTray] = useState(false);
  const [scanlines, setScanlines] = useState(true);
  const [sweep, setSweep] = useState(true);
  const [flicker, setFlicker] = useState(true);
  const [useFont, setFont] = useState(true);
  const [lang, setLang] = useState(false);

  return (
    <CRTEffect
      enabled={true}
      enableScanlines={scanlines}
      enableSweep={sweep}
      theme="custom"
      enableFlicker={flicker}
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

      <Header />

      <button
        className={`tray-tab ${showTray ? 'open' : ''} ${useFont ? 'use-pixel-font' : 'use-normal-font'} ${useFont ? '' : 'tray-tab-normal-font'}`}
        onClick={() => setShowTray(!showTray)}
      >
        SETTINGS
      </button>

      <div className={`settings-tray ${showTray ? 'open' : ''} ${useFont ? '' : 'use-normal-font'}`}>
          <EFXSettings
            scanlines={scanlines}
            setScanlines={setScanlines}
            sweep={sweep}
            setSweep={setSweep}
            flicker={flicker}
            setFlicker={setFlicker}
            useFont={useFont}
            setFont={setFont}
            lang={lang}
            setLang={setLang}
          />
      </div>

      <div
        className="bg"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
        }}
      >
        <main className={`main-content ${useFont ? 'use-pixel-font' : 'use-normal-font'}`}>
        {/* <main className="main-content use-normal-font"> */}
          {children}
        </main>
      </div>
    </CRTEffect>
  );
}

export default Layout;