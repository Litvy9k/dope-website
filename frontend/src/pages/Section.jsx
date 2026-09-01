import { useLocation } from 'react-router-dom';
import '../components/Layout.css'
import { useUI } from '../components/UIContext';
import { t } from '../i18n';
import { labelOf, trailOf } from '../components/nav/sections';

/**
 * 所有栏目暂时都落到这个占位页，只为验证两级路由和导航联动。
 * 真实内容出来之后，各栏目再拆成自己的页面。
 */
function Section() {
  const { pathname } = useLocation();
  const { lang } = useUI();
  const trail = trailOf(pathname);

  // 路径里有段落对不上树，说明是个不存在的地址
  if (!trail.length || trail.length !== pathname.split('/').filter(Boolean).length) {
    return (
      <>
        <h1>404</h1>
        <h2>{`bash: cd: ${pathname}: No such file or directory`}</h2>
      </>
    );
  }

  const here = trail[trail.length - 1];

  return (
    <>
      <h1>{labelOf(here, lang)}</h1>
      <h2>
        {`~${trail.map((n) => '/' + labelOf(n, lang)).join('')} —— ${t('placeholder', lang)}`}
      </h2>
      {here.children && (
        <h2>
          {lang === 'zh'
            ? `这层有 ${here.children.length} 个子栏目，在下面导航栏里。`
            : `${here.children.length} subsections — see the nav bar below.`}
        </h2>
      )}
    </>
  );
}

export default Section;
