import { useState } from 'react';
import './Layout.css';
import Header from './Header';
import bgImage from '../assets/bg.jpg';
import CRTEffect from 'vault66-crt-effect';
import "vault66-crt-effect/dist/vault66-crt-effect.css";

function Layout({ children }) {
  const [showTray, setShowTray] = useState(false);

  return (
    <CRTEffect
      enabled={true}
      enableScanlines={true}
      enableSweep={true}
      theme="custom"
      enableFlicker={true}
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
        className={`tray-tab ${showTray ? 'open' : ''}`}
        onClick={() => setShowTray(!showTray)}
      >
        SETTINGS
      </button>

      <div className={`settings-tray ${showTray ? 'open' : ''}`}>
        <label class="pixel-switch">
          <input type="checkbox" />
          <span class="slider"></span>
        </label>
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
        <main className="main-content">
          {children}
        </main>
      </div>
    </CRTEffect>
  );
}

export default Layout;