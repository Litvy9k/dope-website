import { Fragment } from 'react';
import HighlightText from './HighlightText';
import { useUI } from '../components/UIContext';
import { actions } from './actions';
import { parseMarkup } from './parse';

/**
 * 把带 [标记] 的字符串渲染成正文。
 *
 *   <RichText>{`左下角有个 [settings]设置面板[/settings]，去看看`}</RichText>
 *
 * 能用哪些标记看 actions.js，语法看 parse.js。
 */
function RichText({ children }) {
  const ui = useUI();

  // 不是字符串就原样交回去，方便偶尔直接塞 JSX
  if (typeof children !== 'string') return children;

  return parseMarkup(children).map((node, i) => {
    if (typeof node === 'string') return <Fragment key={i}>{node}</Fragment>;

    const build = actions[node.action];
    if (!build) {
      // 没注册的标记按普通文字显示，顺手提醒一句，免得拼错了默默失效
      console.warn(`[RichText] 未知标记 [${node.action}]，检查 highlight/actions.js`);
      return <Fragment key={i}>{node.children}</Fragment>;
    }

    const props = build({ value: node.value, attrs: node.attrs, ui });
    return (
      <HighlightText key={i} {...props}>
        {node.children}
      </HighlightText>
    );
  });
}

export default RichText;
