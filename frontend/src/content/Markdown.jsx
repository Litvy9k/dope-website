import { Fragment } from 'react';
import { marked } from 'marked';
import RichText from '../highlight/RichText';
import './Markdown.css';
import { scaleOf } from './fontScale';

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

/**
 * marked 的 GFM 会把正文里的裸 URL 自动变成 link token，而 [link=https://…]
 * 的地址正好就是一个裸 URL —— 它被切走之后，'[link=' 和 '] …[/link]' 落在
 * 两个不同的 token 里，下面的合并再也拼不出一条完整的标记，整条原样显示成
 * 文字。加引号写成 [link href="https://…"] 也救不了：URL 照样被抓走，而且
 * 抓走的 raw 里连那个 ] 一起吞了，剩下的文字仍然能匹配成一条标记，只是
 * href 变成空字符串 —— 这种更糟，页面上看不出任何异常。
 *
 * 所以自动链接产生的 link token 按纯文本处理，原样塞回 buffer。raw 是逐字
 * 的，拼回去和原文一模一样。markdown 的 [文字](地址) 和尖括号 <https://…>
 * 不受影响，它们的 raw 以 [ 或 < 开头。
 *
 * 代价：正文里单独写一个裸 URL 不再自动变成链接。要链接就写 [link=地址] 或
 * markdown 的 [文字](地址)，两条路都是显式的。
 */
const isAutolink = (token) =>
  token.type === 'link' && !token.raw.startsWith('[') && !token.raw.startsWith('<');

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
    if (PLAIN.has(token.type) || isAutolink(token)) {
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

export default function Markdown({ children, fontScale }) {
  if (!children) return null;
  const scale = scaleOf(fontScale);
  return (
    <div className="md" style={scale ? { '--md-scale': scale } : undefined}>
      {Block({ tokens: marked.lexer(children) })}
    </div>
  );
}
