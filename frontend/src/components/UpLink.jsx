import { Link, useLocation } from 'react-router-dom';
import { useUI } from './UIContext';
import { t } from '../i18n';
import { trailOf, labelOf } from './nav/sections';
import './UpLink.css';

/**
 * 返回上一层。
 *
 * 只用一个箭头加目标名称 —— 之前写成 $ cd .. 虽然贴合终端主题，
 * 但对不写代码的人是天书。箭头是通用语言，名字直接说明去哪。
 *
 * 走的是"上一层目录"而不是浏览器历史：历史返回会把人送回他上次待的
 * 地方，从搜索引擎直接进深层页面时那是不可预测的；上一层则从任何
 * 入口进来结果都一样。
 */
export default function UpLink() {
  const { pathname } = useLocation();
  const { lang } = useUI();

  if (pathname === '/') return null;

  const parent = pathname.split('/').slice(0, -1).join('/') || '/';
  const parentTrail = trailOf(parent);
  const name = parentTrail.length
    ? labelOf(parentTrail[parentTrail.length - 1], lang)
    : t('home', lang);

  return (
    <Link className="up-link" to={parent}>
      {/* 一格一格拼出来的箭头，和底栏那个同一套画法 */}
      <svg className="up-arrow" viewBox="0 0 12 9" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="0" y="4" width="1" height="1" />
        <rect x="1" y="3" width="1" height="3" />
        <rect x="2" y="2" width="1" height="5" />
        <rect x="3" y="1" width="1" height="7" />
        <rect x="4" y="0" width="1" height="9" />
        <rect x="5" y="3" width="7" height="3" />
      </svg>
      <span className="up-name">{name}</span>
    </Link>
  );
}
