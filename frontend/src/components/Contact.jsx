import { Fragment } from 'react';
import { pick } from '../content/posts';
import './Contact.css';

/**
 * 联系方式，渲染成一段命令输出的样子：
 *
 *   $ contact --list
 *   linkedin   /in/peter-liu
 *   email      someone@example.com
 *
 * 数据写在 frontmatter 的 contact 里，不写进正文 —— 和 tags / rating 一样是
 * 结构化字段，将来想在别的页面也放一份就是加一行调用的事。
 *
 * 两列是 CSS grid 对齐的，不是空格。**站点字体不是等宽的**（实测
 * "iiiiiiiiii" 47.84px 对 "MMMMMMMMMM" 127.56px），手动对齐一定会参差。
 *
 * @param items frontmatter 的 contact 数组，每项 { label, value, href }
 */
export default function Contact({ items, lang }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const rows = items.filter((item) => {
    if (item && (item.label || item.value || item.href)) return true;
    // 静默跳过的话，页面上少一行而没有任何提示 —— 和写错参数名一样看不出来
    console.warn('[contact] 这一项没有 label / value / href，已跳过：', item);
    return false;
  });
  if (rows.length === 0) return null;

  return (
    <section className="contact" aria-label="contact">
      {/* 提示符和底栏那行同款，用的是同一套配色。这行是装饰，
          aria-hidden 掉，读屏软件念 section 的 label 就够了 */}
      <div className="contact-cmd" aria-hidden="true">
        <span className="contact-sign">$</span>
        <span className="contact-name">contact --list</span>
      </div>

      <dl className="contact-list">
        {rows.map((item, i) => {
          const label = pick(item.label, lang) || '—';
          // 只写 href 不写 value 时，把地址本身当显示文字
          const text = pick(item.value, lang) || item.href || '';
          return (
            /* dt / dd 直接做 grid 的子项，靠自动填格落进两列 ——
               包一层再用 subgrid 也行，但那是没必要的兼容性风险 */
            <Fragment key={`${label}-${i}`}>
              <dt className="contact-label">{label}</dt>
              <dd className="contact-value">
                {item.href ? (
                  /* 外链一律新窗口，和正文里的 markdown 链接、[link] 标记一致 */
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    {text}
                  </a>
                ) : (
                  text
                )}
              </dd>
            </Fragment>
          );
        })}
      </dl>
    </section>
  );
}
