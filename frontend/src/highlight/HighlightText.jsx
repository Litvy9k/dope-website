import { useCallback, useEffect, useId, useRef, useState } from 'react';
import './highlight.css';

/**
 * 正文里的可交互高亮片段：荧光黄 + 下划线，激活时罩一圈荧光。
 *
 * 桌面端悬浮激活，触屏点击激活（再点一次或点别处收起），键盘可聚焦。
 *
 * 一般不直接用这个，正文里写 [标记] 交给 <RichText> 渲染就行。
 *
 *   <HighlightText tooltip="1996 年，王家卫">重庆森林</HighlightText>
 *
 * @param tooltip      有值就在激活时浮出信息框；可以是字符串或 JSX
 * @param tooltipImage 信息框里的图片地址，默认排在文字上方
 * @param onActivate   激活时触发（悬浮进入 / 点击 / 获得焦点）
 * @param onDeactivate 取消激活时触发
 * @param onSelect     明确的点击或回车，和悬浮无关
 */
function HighlightText({
  children,
  tooltip,
  tooltipImage,
  spoiler,
  onActivate,
  onDeactivate,
  onSelect,
}) {
  // 只有图没有字也是个有效的 tooltip
  const hasTooltip = Boolean(tooltip || tooltipImage);
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const rootRef = useRef(null);
  const tipRef = useRef(null);
  const tooltipId = useId();

  // 用 ref 挡住重复触发，免得 onActivate 被连着调用两次
  const activate = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    setActive(true);
    onActivate?.();
  }, [onActivate]);

  const deactivate = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    setActive(false);
    onDeactivate?.();
  }, [onDeactivate]);

  // 触屏没有"移开"这回事，点到别处才算收起。
  // 桌面端 pointerleave 会先一步收起，这个监听只是兜底。
  useEffect(() => {
    if (!active) return;

    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) deactivate();
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') deactivate();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [active, deactivate]);

  // tooltip 贴边时会溢出屏幕，量一下往回推；上方放不下就翻到下方
  useEffect(() => {
    const el = tipRef.current;
    if (!active || !hasTooltip || !el) return;

    const place = () => {
      const margin = 8;
      el.style.setProperty('--tip-shift', '0px');
      el.classList.remove('below');

      const rect = el.getBoundingClientRect();
      let shift = 0;
      if (rect.left < margin) {
        shift = margin - rect.left;
      } else if (rect.right > window.innerWidth - margin) {
        shift = window.innerWidth - margin - rect.right;
      }
      el.style.setProperty('--tip-shift', `${shift}px`);

      if (rect.top < margin) el.classList.add('below');
    };

    place();

    // 图片是异步解码的，加载完 tooltip 会变高。而"上方放不下就翻下去"是按
    // 当时的高度判断的 —— 不重算的话，带图的 tooltip 会在图出来之后长出屏幕
    // 顶部。已经 complete 的（缓存命中）不用等，place() 那次就量准了。
    const pending = [...el.querySelectorAll('img')].filter((img) => !img.complete);
    pending.forEach((img) => {
      img.addEventListener('load', place);
      img.addEventListener('error', place);
    });
    return () => {
      pending.forEach((img) => {
        img.removeEventListener('load', place);
        img.removeEventListener('error', place);
      });
    };
  }, [active, hasTooltip, tooltip, tooltipImage]);

  const interactive = Boolean(hasTooltip || spoiler || onActivate || onSelect);

  return (
    <span
      ref={rootRef}
      className={`highlight-text ${active ? 'is-active' : ''} ${
        spoiler ? `is-spoiler ${active ? 'is-revealed' : ''}` : ''
      }`}
      // 触屏的 pointerenter 时机不可靠，交给 click 处理
      onPointerEnter={(e) => e.pointerType !== 'touch' && activate()}
      onPointerLeave={(e) => e.pointerType !== 'touch' && deactivate()}
      onClick={(e) => {
        onSelect?.(e);
        if (activeRef.current) deactivate();
        else activate();
      }}
      // 只认键盘焦点。触屏点击的事件顺序是 focus → click，
      // 若这里无条件 activate，紧接着 click 的切换逻辑会发现"已激活"
      // 又把它关掉 —— 表现就是第一次点只闪一下，第二次才正常。
      // :focus-visible 恰好能区分键盘聚焦和指针点击带来的聚焦
      onFocus={(e) => {
        try {
          if (e.target.matches(':focus-visible')) activate();
        } catch {
          // 老浏览器不认 :focus-visible，退回原来的行为
          activate();
        }
      }}
      onBlur={deactivate}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        onSelect?.(e);
        if (!activeRef.current) activate();
      }}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      aria-expanded={hasTooltip ? active : undefined}
      aria-describedby={hasTooltip && active ? tooltipId : undefined}
    >
      {/* 下划线画在内层：祖先元素的 text-decoration 会穿透到子元素，
          子元素改不掉，画在外层的话 tooltip 也会被划一道线 */}
      <span className="highlight-label">{children}</span>

      {hasTooltip && active && (
        <span className="highlight-tooltip" id={tooltipId} role="tooltip" ref={tipRef}>
          {/* 图在上、字在下。alt 留空是有意的：紧挨着的 tooltip 文字就是
              它的说明，再念一遍图片地址反而更吵 */}
          {tooltipImage && (
            <img className="highlight-tooltip-img" src={tooltipImage} alt="" />
          )}
          {tooltip}
        </span>
      )}
    </span>
  );
}

export default HighlightText;
