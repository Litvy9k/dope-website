import React from 'react';
import './pixelated_switch.css';

export default function EFXSettings({
  scanlines, setScanlines,
  sweep, setSweep,
  flicker, setFlicker,
  font, setFont
}) {
  return (
    <div className="efx-settings">
      <div className="setting-row">
        <label>Scanlines</label>
        <label className="switch">
          <input
            className="toggle"
            type="checkbox"
            checked={scanlines}
            onChange={(e) => setScanlines(e.target.checked)}
          />
          <span className="slider"></span>
          <span className="card-side"></span>
        </label>
      </div>

      <div className="setting-row">
        <label>Sweep</label>
        <label className="switch">
          <input
            className="toggle"
            type="checkbox"
            checked={sweep}
            onChange={(e) => setSweep(e.target.checked)}
          />
          <span className="slider"></span>
          <span className="card-side"></span>
        </label>
      </div>

      <div className="setting-row">
        <label>Flicker</label>
        <label className="switch">
          <input
            className="toggle"
            type="checkbox"
            checked={flicker}
            onChange={(e) => setFlicker(e.target.checked)}
          />
          <span className="slider"></span>
          <span className="card-side"></span>
        </label>
      </div>

      <div className="setting-row">
        <label>Pixel Font</label>
        <label className="switch">
          <input
            className="toggle"
            type="checkbox"
            checked={font}
            onChange={(e) => setFont(e.target.checked)}
          />
          <span className="slider"></span>
          <span className="card-side"></span>
        </label>
      </div>
    </div>
  );
}