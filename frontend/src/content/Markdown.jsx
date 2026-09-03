import { Fragment } from 'react';
import { marked } from 'marked';
import RichText from '../highlight/RichText';
import './Markdown.css';

/**
 * Markdown 正文渲染。
 *
 * 走 token 而不是 marked 输出的 HTML 字符串 —— 因为正文里的 [标记] 要变成
 * 带悬浮事件的 React 组件，HTML 字符串塞不进去。所以在这里把 token 渲染成
 * React，文字节点交给 <RichText> 过一遍标记。
 *
 * markdown 的链接 [文字](地址) 和 [标记]...[/标记] 不冲突：
 * 标记解析要求有配对的闭合标签，链接没有，不会被误判。
 */
const PLAIN = new Set(['text', 'escape', 'html']);

function Inline({ tokens }) {
  if (!tokens) return null;

  const out = [];
  let buffer = '';

  // marked 会把一段文字切成好几个 text token，而 [标记] 需要开闭标签在
  // 同一个字符串里才认得出来。所以先把相邻的纯文本拼回去再交给 RichText。
  const flush = () => {
    if (!buffer) return;
    out.push(<RichText key={`t${out.length}`}>{buffer}</RichText>);
    buffer = '';
  };

  tokens.forEach((token) => {
    if (PLAIN.has(token.type)) {
      buffer += token.raw;
      return;
    }
    flush();

    const key = `n${out.length}`;
    switch (token.type) {
      case 'strong':
        out.push(<strong key={key}><Inline tokens={token.tokens} /></strong>);
        break;
      case 'em':
        out.push(<em key={key}><Inline tokens={token.tokens} /></em>);
        break;
      case 'del':
        out.push(<del key={key}><Inline tokens={token.tokens} /></del>);
        break;
      case 'codespan':
        out.push(<code key={key}>{token.text}</code>);
        break;
      case 'br':
        out.push(<br key={key} />);
        break;
      case 'link':
        out.push(
          <a key={key} href={token.href} target="_blank" rel="noopener noreferrer">
            <Inline tokens={token.tokens} />
          </a>
        );
        break;
      default:
        out.push(<Fragment key={key}>{token.raw}</Fragment>);
    }
  });

  flush();
  return out;
}

function Block({ tokens }) {
  return tokens.map((token, i) => {
    switch (token.type) {
      case 'heading': {
        const Tag = `h${Math.min(token.depth + 1, 6)}`;
        return <Tag key={i}><Inline tokens={token.tokens} /></Tag>;
      }
      case 'paragraph':
        return <p key={i}><Inline tokens={token.tokens} /></p>;
      case 'blockquote':
        return <blockquote key={i}><Block tokens={token.tokens} /></blockquote>;
      case 'list':
        return token.ordered ? (
          <ol key={i}>
            {token.items.map((item, j) => (
              <li key={j}><Inline tokens={item.tokens} /></li>
            ))}
          </ol>
        ) : (
          <ul key={i}>
            {token.items.map((item, j) => (
              <li key={j}><Inline tokens={item.tokens} /></li>
            ))}
          </ul>
        );
      case 'code':
        return <pre key={i}><code>{token.text}</code></pre>;
      case 'hr':
        return <hr key={i} />;
      case 'space':
        return null;
      default:
        return <p key={i}><RichText>{token.raw}</RichText></p>;
    }
  });
}

/**
 * frontmatter 里的 fontScale 是个倍率，不是绝对字号 —— 写死 px 的话这篇
 * 就退出了随视口缩放那套（见 fonts.css 的 --content-font-size），
 * 在大屏上会重新变回"太小"。倍率是叠在基准之上的，两者不打架。
 *
 * 夹在一个区间里：1.3 手滑写成 13 的话，不至于糊一屏才发现。
 */
const SCALE_MIN = 0.8;
const SCALE_MAX = 1.6;

function scaleOf(value) {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) {
    console.warn(`[Markdown] fontScale "${value}" 不是数字，已忽略`);
    return null;
  }
  const clamped = Math.min(Math.max(n, SCALE_MIN), SCALE_MAX);
  if (clamped !== n) {
    console.warn(`[Markdown] fontScale ${n} 超出 ${SCALE_MIN}–${SCALE_MAX}，按 ${clamped} 处理`);
  }
  return clamped;
}

export default function Markdown({ children, fontScale }) {
  if (!children) return null;
  const scale = scaleOf(fontScale);
  return (
    <div className="md" style={scale ? { '--md-scale': scale } : undefined}>
      {Block({ tokens: marked.lexer(children) })}
    </div>
  );
}
