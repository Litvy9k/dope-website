import { useEffect, useId, useRef } from 'react';
import { t } from '../i18n';
import './pixelated_switch.css';
import './SetupPanel.css';

function Toggle({ label, checked, onChange }) {
  return (
    <div className="setting-row">
      <label>{label}</label>
      <label className="switch">
        <input
          className="toggle"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="slider"></span>
        <span className="card-side"></span>
      </label>
    </div>
  );
}

/**
 * 设置面板。DOS 对话框的样子，但不是模态 ——
 * 它调的是扫描线、闪烁这类全屏效果，得能一边调一边看页面本身的变化，
 * 蒙一层遮罩反而挡住了要看的东西。页面在开着的时候照常可用。
 */
export default function SetupPanel({
  onClose,
  triggerRef,
  lang,
  useFont,
  scanlines, setScanlines,
  sweep, setSweep,
  flicker, setFlicker,
  setFont,
  chinese, setChinese,
}) {
  const panelRef = useRef(null);
  const titleId = useId();

  // 开面板时把焦点移进来，但不做焦点陷阱 —— Tab 可以正常走出去回到页面
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    // 点面板和触发按钮以外的地方就收起。没有遮罩，所以这一下点击照常传到页面上
    const onPointerDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (triggerRef?.current?.contains(e.target)) return;
      onClose();
    };

    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      onClose();
      // 焦点还回按钮，否则键盘用户会掉到页面开头
      triggerRef?.current?.focus();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, triggerRef]);

  return (
    <div
      ref={panelRef}
      className={`setup-panel ${useFont ? '' : 'use-normal-font'}`}
      role="group"
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <div className="setup-title" id={titleId}>{t('setup', lang)}</div>

      <div className="efx-settings">
        <Toggle label={t('scanlines', lang)} checked={scanlines} onChange={setScanlines} />
        <Toggle label={t('sweep', lang)} checked={sweep} onChange={setSweep} />
        <Toggle label={t('flicker', lang)} checked={flicker} onChange={setFlicker} />
        <Toggle label={t('pixelFont', lang)} checked={useFont} onChange={setFont} />
        <Toggle label={t('chinese', lang)} checked={chinese} onChange={setChinese} />
      </div>

      <button
        className="setup-footer"
        onClick={() => {
          onClose();
          triggerRef?.current?.focus();
        }}
      >
        [ESC] {t('close', lang)}
      </button>
    </div>
  );
}
