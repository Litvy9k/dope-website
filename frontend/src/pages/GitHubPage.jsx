import { Fragment } from 'react';
import { useUI } from '../components/UIContext';
import { t } from '../i18n';
import PixelStar from '../components/PixelStar';
import './GitHubPage.css';

/**
 * /abt-me/github：GitHub 个人主页的站内版。
 *
 * 数据不是这里拉的 —— 是 scripts/fetch-github.mjs 在构建前拉成的快照
 * （为什么只能在构建时拉，见那个文件开头）。这个组件只负责把快照画出来，
 * 不关心它来自 GraphQL 还是退回的 REST：两边的形状在脚本里就对齐了，
 * 差别只在"有没有这一块"。
 *
 * 用 import.meta.glob 而不是直接 import：快照是生成物、被 gitignore 的，
 * 没跑过脚本就直接 vite build 的话，直接 import 会报"找不到模块"让整站
 * 构建失败；glob 找不到只是个空对象，这一页显示离线，别的页面照常。
 */
const found = import.meta.glob('../github/snapshot.json', { eager: true, import: 'default' });
const SNAPSHOT = Object.values(found)[0] ?? { source: 'offline', login: 'Litvy9k' };

const LOCALE = { en: 'en', zh: 'zh-CN' };

/** i18n 里的 {n} {m} 这类占位符。没给值的原样留着，一眼能看出漏传了什么 */
function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? vars[key] : m));
}

/** 英文的单复数。中文模板里没有这些占位符，传了也用不上 */
function words(n) {
  const one = n === 1;
  return {
    contributions: one ? 'contribution' : 'contributions',
    commits: one ? 'commit' : 'commits',
    pushes: one ? 'push' : 'pushes',
    times: one ? 'time' : 'times',
    repositories: one ? 'repository' : 'repositories',
  };
}

/** 日期是 YYYY-MM-DD，按 UTC 解析和格式化 —— 按本地时区解析的话，UTC 以西的访客会看到前一天 */
const utc = (ymd) => new Date(`${ymd}T00:00:00Z`);

/**
 * 每日定时构建的时间，换算成新西兰当地时间。快照里存的是 UTC（fetch-github.mjs
 * 从 deploy.yml 的 cron 读来的）。
 *
 * 在访客的浏览器里按"今天"换算，不在构建时写死：cron 是固定的 UTC，而新西兰
 * 有夏令时 —— 18:17 UTC 在冬令时是 06:17，九月底进入夏令时后是 07:17。
 * 写死一个 06:17，一年里有一半时间是错的。
 */
function refreshTime(refresh) {
  if (!refresh) return null;
  const now = new Date();
  const at = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), refresh.utcHour, refresh.utcMinute),
  );
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(at);
}

function ExternalLink({ href, className, children }) {
  // 外链一律新窗口，和正文里的 markdown 链接、[link] 标记、联系方式一致
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/**
 * 每块上面那行命令。和 Contact 的 `$ contact --list` 同一个样子。
 * 命令是语法不是英语，不进 i18n；也是纯装饰，读屏软件读下面的标题就够了。
 */
function Cmd({ children }) {
  return (
    <div className="gh-cmd" aria-hidden="true">
      <span className="gh-sign">$</span>
      <span className="gh-cmd-name">{children}</span>
    </div>
  );
}

/**
 * 语言色块。GitHub 画的是圆点，这里是方的 —— 圆在点阵调子里是唯一一个
 * 抗锯齿的形状，和评分条、锁链、灯管弯头放在一起会出戏。
 */
function Language({ language }) {
  if (!language) return null;
  return (
    <span className="gh-lang">
      <span className="gh-lang-mark" style={{ '--lang': language.color || '#7dffb0' }} aria-hidden="true" />
      {language.name}
    </span>
  );
}

function Profile({ data, lang }) {
  const p = data.profile ?? {};
  const facts = [
    p.location && { label: t('ghLocation', lang), value: p.location },
    ...(data.social ?? []).map((s) => ({
      // 平台名是专有名词，照原样；"generic" 那一项是个人网站，这个词要翻
      label: s.provider === 'generic' ? t('ghWebsite', lang) : s.provider,
      value: s.label,
      href: s.url,
    })),
    p.publicRepos != null && { label: t('ghRepos', lang), value: p.publicRepos },
  ].filter(Boolean);

  return (
    <aside className="gh-side">
      <Cmd>gh api users/{data.login}</Cmd>

      {/* 头像和资料包成一张卡：够宽时横排（头像在左），手机上竖排。
          为什么不是 GitHub 那样的左侧栏，见 GitHubPage.css 的 .gh-layout */}
      <div className="gh-card">
        {/* alt 留空：名字就在紧旁边，读屏再念一遍"头像"是噪音 */}
        {p.avatar && <img className="gh-avatar" src={p.avatar} alt="" width="460" height="460" />}

        <div className="gh-id">
          <p className="gh-name">{p.name || data.login}</p>
          <p className="gh-login">
            {data.login}
            {p.pronouns && <span className="gh-pronouns"> · {p.pronouns}</span>}
          </p>
          {p.bio && <p className="gh-bio">{p.bio}</p>}

          {facts.length > 0 && (
            <dl className="gh-facts">
              {facts.map((f, i) => (
                <Fragment key={`${f.label}-${i}`}>
                  <dt className="gh-fact-label">{f.label}</dt>
                  <dd className="gh-fact-value">
                    {f.href ? <ExternalLink href={f.href}>{f.value}</ExternalLink> : f.value}
                  </dd>
                </Fragment>
              ))}
            </dl>
          )}

          {data.orgs?.length > 0 && (
            <div className="gh-orgs">
              <p className="gh-fact-label">{t('ghOrgs', lang)}</p>
              <ul className="gh-org-list">
                {data.orgs.map((o) => (
                  <li key={o.login}>
                    <ExternalLink href={o.url} className="gh-org">
                      {o.avatar && <img className="gh-org-avatar" src={o.avatar} alt="" width="96" height="96" />}
                      {o.name || o.login}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {p.url && (
            <ExternalLink href={p.url} className="gh-open">
              {t('ghOpen', lang)}
            </ExternalLink>
          )}
        </div>
      </div>
    </aside>
  );
}

function Repos({ data, lang }) {
  const repos = data.repos;
  if (!repos?.items?.length) return null;

  /*
   * 两档数据都是置顶：有 token 时是 GitHub 上真实的置顶，没有时是
   * fetch-github.mjs 里 PINNED_FALLBACK 手写的名单 —— 不拿"最近推送"凑数。
   */
  return (
    <section className="gh-section">
      <Cmd>gh repo list {data.login} --pinned</Cmd>
      <h2 className="gh-title">{t('ghPinned', lang)}</h2>

      <ul className="gh-repos">
        {repos.items.map((r) => (
          <li key={r.url} className="gh-repo gh-panel">
            {/* 和帖子列表里置顶卡片同一颗星：置顶就是置顶，全站用同一个记号 */}
            <PixelStar className="gh-repo-star" />
            <div className="gh-repo-head">
              <ExternalLink href={r.url} className="gh-repo-name">
                {r.name}
              </ExternalLink>
              {r.isFork && <span className="gh-badge">{t('ghFork', lang)}</span>}
            </div>
            {r.description && <p className="gh-repo-desc">{r.description}</p>}
            <div className="gh-repo-meta">
              <Language language={r.language} />
              {r.stars > 0 && (
                <span>
                  {r.stars} {t('ghStars', lang)}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * 贡献日历。整个是一个 grid：第一行月份、第一列星期、其余每格一天。
 *
 * 月份标签、星期标签和格子放在同一个 grid 里，而不是三个容器各排各的 ——
 * 格子是 aspect-ratio: 1、宽度跟着容器走，行高因此是算出来的，另起一个容器
 * 去对齐它必然差几像素。同一个 grid 里天然对齐。
 *
 * 每一天用 grid-row = 星期几 显式定位：第一周通常不满七天（从一年前的那个
 * 星期几开始），按顺序自动填格的话整张图会错位一格。
 */
function CalendarGrid({ calendar, lang }) {
  const locale = LOCALE[lang];
  const monthFmt = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
  const dayFmt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' });
  const { weeks } = calendar;

  // 月份换了就在那一列标上。最后两列不标：标签是溢出格子的，贴着右边缘会伸出
  // 滚动容器，平白多出一条横向滚动
  const months = [];
  let previous = -1;
  weeks.forEach((week, i) => {
    if (!week[0]) return;
    const month = utc(week[0].date).getUTCMonth();
    if (month !== previous) {
      if (i < weeks.length - 2) months.push({ col: i, text: monthFmt.format(utc(week[0].date)) });
      previous = month;
    }
  });
  // 第一个月只露出一两列时，名字会和下一个月叠在一起 —— GitHub 也是直接不标
  if (months.length > 1 && months[1].col - months[0].col < 3) months.shift();

  const label = fill(t('ghContribYear', lang), { n: calendar.total, ...words(calendar.total) });

  return (
    <div className="gh-cal-scroll gh-panel">
      <div className="gh-cal" style={{ '--weeks': weeks.length }} role="img" aria-label={label}>
        {months.map((m) => (
          <span key={m.col} className="gh-cal-month" style={{ gridColumn: m.col + 2 }} aria-hidden="true">
            {m.text}
          </span>
        ))}
        {[
          [1, 'ghMon'],
          [3, 'ghWed'],
          [5, 'ghFri'],
        ].map(([weekday, key]) => (
          <span key={key} className="gh-cal-weekday" style={{ gridRow: weekday + 2 }} aria-hidden="true">
            {t(key, lang)}
          </span>
        ))}
        {weeks.map((week, i) =>
          week.map((d) => (
            <span
              key={d.date}
              className="gh-day"
              data-level={d.level}
              style={{ gridColumn: i + 2, gridRow: d.weekday + 2 }}
              title={fill(t('ghDayTip', lang), { n: d.count, date: dayFmt.format(utc(d.date)), ...words(d.count) })}
            />
          )),
        )}
      </div>

      <div className="gh-legend" aria-hidden="true">
        <span>{t('ghLess', lang)}</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className="gh-day" data-level={level} />
        ))}
        <span>{t('ghMore', lang)}</span>
      </div>
    </div>
  );
}

function Calendar({ data, lang }) {
  const calendar = data.calendar;
  return (
    <section className="gh-section">
      <Cmd>gh contributions {data.login} --last-year</Cmd>
      {calendar ? (
        <>
          <h2 className="gh-title">
            {fill(t('ghContribYear', lang), { n: calendar.total, ...words(calendar.total) })}
          </h2>
          <CalendarGrid calendar={calendar} lang={lang} />
        </>
      ) : (
        // 没有日历就明说为什么没有，而不是整块消失 —— 消失的话看不出是降级了
        <p className="gh-note"># {t('ghNeedToken', lang)}</p>
      )}
    </section>
  );
}

/** 本月每个仓库一条，后面跟一截像素条。条的画法和评分条一样（Rating.jsx） */
const BAR_SEGMENTS = 12;

function Activity({ data, lang }) {
  const a = data.activity;
  if (!a) return null;

  const monthLabel = new Intl.DateTimeFormat(LOCALE[lang], {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(utc(`${a.month}-01`));
  const commits = a.kind === 'commits';
  const top = Math.max(1, ...a.repos.map((r) => r.count));

  return (
    <section className="gh-section">
      <Cmd>
        gh activity {data.login} --month {a.month}
      </Cmd>
      <h2 className="gh-title">
        {t('ghActivity', lang)} · {monthLabel}
      </h2>

      {a.repos.length > 0 && (
        <>
          <p className="gh-act-head">
            {fill(t(commits ? 'ghCommits' : 'ghPushes', lang), {
              n: a.total,
              m: a.repos.length,
              ...words(a.total),
              repositories: words(a.repos.length).repositories,
            })}
          </p>
          <ul className="gh-act">
            {a.repos.map((r) => {
              const lit = Math.max(1, Math.round((r.count / top) * BAR_SEGMENTS));
              return (
                <li key={r.url} className="gh-act-row">
                  <ExternalLink href={r.url} className="gh-act-name">
                    {r.name}
                  </ExternalLink>
                  <span className="gh-act-count">
                    {fill(t(commits ? 'ghCommitCount' : 'ghPushCount', lang), { n: r.count, ...words(r.count) })}
                  </span>
                  <span className="gh-bar" aria-hidden="true">
                    {Array.from({ length: BAR_SEGMENTS }, (_, i) => (
                      <span key={i} className={`gh-seg ${i < lit ? 'is-on' : ''}`} />
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {a.created.length > 0 && (
        <>
          <p className="gh-act-head">
            {fill(t('ghCreated', lang), { n: a.created.length, ...words(a.created.length) })}
          </p>
          <ul className="gh-created">
            {a.created.map((c) => (
              <li key={c.url} className="gh-created-row">
                <ExternalLink href={c.url} className="gh-act-name">
                  {c.name}
                </ExternalLink>
                {c.isFork && <span className="gh-badge">{t('ghFork', lang)}</span>}
                <Language language={c.language} />
                <span className="gh-created-date">{c.date}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {a.repos.length === 0 && a.created.length === 0 && <p className="gh-note"># {t('ghNoActivity', lang)}</p>}
    </section>
  );
}

export default function GitHubPage() {
  const { lang } = useUI();
  const data = SNAPSHOT;

  /*
   * 页面顶上写明数据来源和快照日期。降级（REST）或离线时，读者和作者都能
   * 从这一行看出来 —— 不写的话"没有日历"和"日历坏了"在页面上长得一样。
   */
  const schedule = refreshTime(data.refresh);
  const sourceLine = [
    `${t('ghSource', lang)}: ${data.source === 'graphql' ? 'api.github.com/graphql' : 'api.github.com (REST)'}`,
    `${t('ghSnapshot', lang)} ${data.fetchedAt}`,
    // 快照日期后面紧跟"每天几点更新"：读的人看到日期，下一个问题就是它多久刷新一次
    schedule && fill(t('ghSchedule', lang), { time: schedule }),
    data.source !== 'graphql' && t('ghRestNote', lang),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="page gh">
      <h1>{t('github', lang)}</h1>

      {data.source === 'offline' ? (
        <div className="gh-offline">
          <Cmd>gh api users/{data.login}</Cmd>
          <p className="gh-note">error: {t('ghOffline', lang)}</p>
          <ExternalLink href={`https://github.com/${data.login}`} className="gh-open">
            github.com/{data.login}
          </ExternalLink>
        </div>
      ) : (
        <>
          <p className="gh-source"># {sourceLine}</p>
          <div className="gh-layout">
            <Profile data={data} lang={lang} />
            <div className="gh-main">
              <Repos data={data} lang={lang} />
              <Calendar data={data} lang={lang} />
              <Activity data={data} lang={lang} />
            </div>
          </div>
        </>
      )}
    </article>
  );
}
