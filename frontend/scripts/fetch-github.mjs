/**
 * 构建前把 GitHub 资料拉成一份快照，给 /abt-me/github 用（pages/GitHubPage.jsx）。
 *
 * ── 为什么是构建时，不是浏览器里现拉 ──────────────────────
 *
 * 那一页最像 GitHub 的两块 —— 置顶仓库和绿格子贡献日历 —— REST API 里根本
 * 没有，只有 GraphQL API 有，而 GraphQL 不管查什么都必须带 token。这个站是
 * 纯静态的，token 放进浏览器端代码就等于公开。所以只能在构建时用 token 拉，
 * 烘焙成 JSON 打进包里。代价是数据跟着部署走：推一次代码更新一次。
 *
 * 顺带的好处：访客不会各自去打 GitHub API（未认证每个 IP 一小时只有 60 次），
 * 头像也是构建时下载到本地的，页面不向任何第三方域名发请求。
 *
 * ── 三档，从好到差 ────────────────────────────────────
 *
 *   graphql  有 GITHUB_TOKEN（CI 里用 Actions 自带的那个）。全部数据
 *   rest     没 token，或者 GraphQL 失败。只有资料、置顶（照下面 PINNED_FALLBACK
 *            手写的名单挑）、本月推送；没有日历。而且 PushEvent 在 2025 年被砍掉
 *            了 size 字段，数不出 commit 数，只能数推送次数 —— 页面上照实写"推送"
 *   offline  两个都失败。有上一份快照就原样保留，没有才写一份 offline
 *
 * **任何情况下都不以非零状态退出。** GitHub 挂了不该拖住部署。但降级也不能
 * 悄悄发生：CI 里打 ::warning::，页面顶上那行也写明数据来自哪一档。
 *
 * ── 内容没变就不写文件 ────────────────────────────────
 *
 * 快照放在 src/ 底下，scripts/subset-font.mjs 会扫它（仓库描述里可能有中文，
 * 不扫的话那几个字会静默掉回系统字体）。而那个脚本按 mtime 判断字体要不要
 * 重算 —— 每次都重写快照，四个字体（含 23MB 的思源）每次 npm run dev 都要
 * 重新子集化，好几秒。所以只在内容变了、或者日期换了一天时才写；
 * fetchedAt 因此只记到日。
 *
 * ── 本地开发 ──────────────────────────────────────────
 *
 * 想看完整数据：在系统环境变量里设 GITHUB_TOKEN（fine-grained token，不勾
 * 任何权限就够读公开资料），重开终端再 npm run dev。**不要写进仓库里的任何
 * 文件** —— 这个仓库是公开的。
 * 本地 10 分钟内重复启动不再请求（记在 node_modules/.cache），CI 每次都拉。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const LOGIN = 'Litvy9k';

/*
 * 没有 token 时用的置顶名单。REST API 里根本没有"置顶"这个概念，只能手写。
 *
 * 不拿"最近推送的几个仓库"凑数再标成置顶：那样页面上写着 Pinned，放的却是
 * 另一批仓库，看的人没法分辨。
 *
 * **在 GitHub 上改了置顶，这里要跟着改** —— 否则没 token 的地方（本地开发）
 * 显示的仍是旧的置顶。有 token 的构建读的是 GitHub 上真实的置顶，不看这份。
 * 顺序就是页面上卡片的顺序。
 */
const PINNED_FALLBACK = [
  'INFS803_Group5_2025',
  'COMP842_LLM_citation_verifier',
  'groundstill-re',
  'dope-website',
];
const SCHEMA = 1;
const SNAPSHOT = path.join(root, 'src/github/snapshot.json');
const IMAGE_DIR = path.join(root, 'public/image/github');
const IMAGE_URL = '/image/github';
const CACHE = path.join(root, 'node_modules/.cache/fetch-github.json');
const DEV_TTL_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 15000;
const API = 'https://api.github.com';

/*
 * 头像拉 48px，页面上用 image-rendering: pixelated 放大 —— 48 个像素放到
 * 两百多像素宽，每个像素是四五像素的方块，正好是站里的点阵调子。拉大图再缩
 * 反而会被浏览器平滑掉。
 */
const AVATAR_PX = 48;

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const inCI = Boolean(process.env.CI);

const log = (msg) => console.log(`GitHub 快照：${msg}`);
/** CI 里用 GitHub Actions 的注解格式，降级会在运行摘要里显示成黄色警告 */
const warn = (msg) => console.log(`${inCI ? '::warning::' : ''}GitHub 快照：${msg}`);

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

async function request(url, init = {}) {
  const headers = { 'User-Agent': 'dope-website-build', ...init.headers };
  /*
   * token 只发给 api.github.com。头像在 avatars.githubusercontent.com 上 ——
   * 虽然也是 GitHub 的域名，但它不需要认证，没理由把 token 带过去。
   */
  if (token && url.startsWith(API)) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...init, headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) {
    const exhausted = res.headers.get('x-ratelimit-remaining') === '0' ? '（配额用完）' : '';
    throw new Error(`${res.status} ${res.statusText}${exhausted} ← ${url}`);
  }
  return res;
}

const getJSON = async (url, init) =>
  (
    await request(url, {
      ...init,
      headers: { Accept: 'application/vnd.github+json', ...init?.headers },
    })
  ).json();

/** 下载到 public/image/github/，返回站内路径。字节没变就不写 */
async function saveImage(remote, name) {
  if (!remote) return null;
  try {
    const res = await request(remote);
    const type = res.headers.get('content-type') || '';
    const ext = type.includes('png') ? 'png' : type.includes('gif') ? 'gif' : 'jpg';
    const bytes = Buffer.from(await res.arrayBuffer());
    const file = `${name}.${ext}`;
    const target = path.join(IMAGE_DIR, file);
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
    if (!fs.existsSync(target) || !fs.readFileSync(target).equals(bytes)) {
      fs.writeFileSync(target, bytes);
    }
    return `${IMAGE_URL}/${file}`;
  } catch (e) {
    warn(`${name} 下载失败，页面上不显示这张图：${e.message}`);
    return null;
  }
}

/** LinkedIn 显示成 in/xxx，其余显示成去掉协议的地址 */
function social(provider, url) {
  let label = url;
  try {
    const u = new URL(url);
    label =
      provider === 'linkedin'
        ? u.pathname.replace(/^\/+|\/+$/g, '')
        : `${u.host}${u.pathname}`.replace(/\/+$/, '');
  } catch {
    // 地址解析不了就原样显示
  }
  return { provider, url, label };
}

/** 本月的起点和键。按 UTC 切月 —— GitHub 自己按访客时区切，差几个小时，不值得为此引入时区 */
function currentMonth() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return { now, start, key: start.toISOString().slice(0, 7) };
}

/* ── graphql ──────────────────────────────────────────── */

const QUERY = `
query ($login: String!, $monthStart: DateTime!, $now: DateTime!) {
  user(login: $login) {
    login name pronouns bio location url
    avatarUrl(size: ${AVATAR_PX})
    repositories(ownerAffiliations: OWNER, privacy: PUBLIC) { totalCount }
    socialAccounts(first: 10) { nodes { provider url } }
    organizations(first: 10) { nodes { login name url avatarUrl(size: ${AVATAR_PX}) } }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name url description isFork stargazerCount forkCount
          owner { login }
          primaryLanguage { name color }
        }
      }
    }
    year: contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date weekday contributionCount contributionLevel } }
      }
    }
    month: contributionsCollection(from: $monthStart, to: $now) {
      totalCommitContributions
      commitContributionsByRepository(maxRepositories: 10) {
        repository { nameWithOwner url }
        contributions(first: 1) { totalCount }
      }
      repositoryContributions(first: 10) {
        nodes {
          occurredAt
          repository { nameWithOwner url isFork primaryLanguage { name color } }
        }
      }
    }
  }
}`;

const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

async function viaGraphQL() {
  const month = currentMonth();
  const body = await getJSON(`${API}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: QUERY,
      variables: { login: LOGIN, monthStart: month.start.toISOString(), now: month.now.toISOString() },
    }),
  });
  // GraphQL 出错时 HTTP 照样是 200，错误在 body 里 —— 只看状态码会把一份空数据当成功
  if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join('; '));
  const u = body.data?.user;
  if (!u) throw new Error('返回里没有 user');

  const lang = (l) => (l ? { name: l.name, color: l.color || null } : null);

  return {
    source: 'graphql',
    profile: {
      name: u.name || null,
      pronouns: u.pronouns || null,
      bio: u.bio || null,
      location: u.location || null,
      url: u.url,
      avatar: await saveImage(u.avatarUrl, 'avatar'),
      publicRepos: u.repositories.totalCount,
    },
    social: u.socialAccounts.nodes.map((s) => social(s.provider.toLowerCase(), s.url)),
    orgs: await Promise.all(
      u.organizations.nodes.map(async (o) => ({
        login: o.login,
        name: o.name || null,
        url: o.url,
        avatar: await saveImage(o.avatarUrl, `org-${o.login}`),
      })),
    ),
    repos: {
      kind: 'pinned',
      items: u.pinnedItems.nodes.filter(Boolean).map((r) => ({
        name: r.owner.login === LOGIN ? r.name : `${r.owner.login}/${r.name}`,
        url: r.url,
        description: r.description || null,
        language: lang(r.primaryLanguage),
        stars: r.stargazerCount,
        forks: r.forkCount,
        isFork: r.isFork,
      })),
    },
    calendar: {
      total: u.year.contributionCalendar.totalContributions,
      weeks: u.year.contributionCalendar.weeks.map((w) =>
        w.contributionDays.map((d) => ({
          date: d.date,
          weekday: d.weekday,
          count: d.contributionCount,
          level: LEVELS[d.contributionLevel] ?? 0,
        })),
      ),
    },
    activity: {
      kind: 'commits',
      month: month.key,
      total: u.month.totalCommitContributions,
      repos: u.month.commitContributionsByRepository
        .map((c) => ({
          name: c.repository.nameWithOwner,
          url: c.repository.url,
          count: c.contributions.totalCount,
        }))
        .sort((a, b) => b.count - a.count),
      created: u.month.repositoryContributions.nodes.map((n) => ({
        name: n.repository.nameWithOwner,
        url: n.repository.url,
        isFork: n.repository.isFork,
        language: lang(n.repository.primaryLanguage),
        date: n.occurredAt.slice(0, 10),
      })),
    },
  };
}

/* ── rest ─────────────────────────────────────────────── */

/*
 * REST 的仓库只给语言名不给颜色，这里补一份 linguist 的常用色。
 * 不在表里的语言显示成站点的绿，不会报错。
 */
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  'C#': '#178600',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#663399',
  Shell: '#89e051',
  Go: '#00ADD8',
  Rust: '#dea584',
  'C++': '#f34b7d',
  C: '#555555',
  'Jupyter Notebook': '#DA5B0B',
  Vue: '#41b883',
};

/**
 * 按 PINNED_FALLBACK 的顺序从公开仓库列表里挑。
 *
 * 名单里有、列表里找不到的（改名了、删了、转成私有了）跳过并警告 —— 静默跳过
 * 的话页面上只是少一张卡，看不出是名单过期了。
 * 列表是 per_page=30 拉的，仓库超过 30 个时置顶的那几个可能不在第一页；
 * 现在一共 7 个，到那时再翻页。
 */
function pinnedFromList(repos) {
  const byName = new Map(repos.map((r) => [r.name, r]));
  return PINNED_FALLBACK.flatMap((name) => {
    const r = byName.get(name);
    if (!r) {
      warn(`置顶名单里的 ${name} 不在公开仓库里（改名、删了、或转成私有？），已跳过`);
      return [];
    }
    return [
      {
        name: r.name,
        url: r.html_url,
        description: r.description || null,
        language: r.language ? { name: r.language, color: LANGUAGE_COLORS[r.language] ?? null } : null,
        stars: r.stargazers_count,
        forks: r.forks_count,
        isFork: r.fork,
      },
    ];
  });
}

async function viaREST() {
  const base = `${API}/users/${LOGIN}`;
  const [u, socials, orgs, repos, events] = await Promise.all([
    getJSON(base),
    getJSON(`${base}/social_accounts`),
    getJSON(`${base}/orgs`),
    getJSON(`${base}/repos?type=owner&sort=pushed&per_page=30`),
    getJSON(`${base}/events/public?per_page=100`),
  ]);
  const month = currentMonth();

  const pushes = new Map();
  const created = [];
  for (const e of events) {
    if (!e.created_at.startsWith(month.key)) continue;
    const url = `https://github.com/${e.repo.name}`;
    if (e.type === 'PushEvent') {
      const row = pushes.get(e.repo.name) ?? { name: e.repo.name, url, count: 0 };
      row.count += 1;
      pushes.set(e.repo.name, row);
    } else if (e.type === 'CreateEvent' && e.payload?.ref_type === 'repository') {
      created.push({ name: e.repo.name, url, isFork: false, language: null, date: e.created_at.slice(0, 10) });
    }
  }
  const pushRows = [...pushes.values()].sort((a, b) => b.count - a.count);

  return {
    source: 'rest',
    profile: {
      name: u.name || null,
      pronouns: null,
      bio: u.bio || null,
      location: u.location || null,
      url: u.html_url,
      avatar: await saveImage(`${u.avatar_url}&s=${AVATAR_PX}`, 'avatar'),
      publicRepos: u.public_repos,
    },
    social: socials.map((s) => social(s.provider, s.url)),
    orgs: await Promise.all(
      orgs.map(async (o) => ({
        login: o.login,
        name: null,
        url: `https://github.com/${o.login}`,
        avatar: await saveImage(`${o.avatar_url}&s=${AVATAR_PX}`, `org-${o.login}`),
      })),
    ),
    repos: {
      kind: 'pinned',
      items: pinnedFromList(repos),
    },
    calendar: null,
    activity: {
      kind: 'pushes',
      month: month.key,
      total: pushRows.reduce((n, r) => n + r.count, 0),
      repos: pushRows,
      created,
    },
  };
}

/* ── main ─────────────────────────────────────────────── */

async function main() {
  const existing = readJSON(SNAPSHOT);
  const cache = readJSON(CACHE);

  // 本地短时间内反复启动 dev 不重复请求。token 有无变了就不算数 —— 刚设好 token
  // 的人不该再等十分钟才看到完整数据
  if (
    !inCI &&
    existing &&
    cache &&
    cache.hadToken === Boolean(token) &&
    Date.now() - cache.checkedAt < DEV_TTL_MS
  ) {
    log(`${Math.round((Date.now() - cache.checkedAt) / 60000)} 分钟前查过，跳过（source=${existing.source}）`);
    return;
  }

  let data = null;
  if (token) {
    try {
      data = await viaGraphQL();
    } catch (e) {
      warn(`GraphQL 失败，退回 REST：${e.message}`);
    }
  } else {
    warn('没有 GITHUB_TOKEN，走 REST —— 贡献日历只有 GraphQL 有，这份快照里不会有；置顶按 PINNED_FALLBACK 名单');
  }

  if (!data) {
    try {
      data = await viaREST();
    } catch (e) {
      warn(`REST 也失败：${e.message}`);
    }
  }

  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify({ checkedAt: Date.now(), hadToken: Boolean(token) }));

  if (!data) {
    if (existing) {
      warn(`保留上一份快照（source=${existing.source}，${existing.fetchedAt}）`);
      return;
    }
    data = { source: 'offline' };
  }

  const snapshot = {
    schema: SCHEMA,
    login: LOGIN,
    fetchedAt: new Date().toISOString().slice(0, 10),
    ...data,
  };
  if (existing && JSON.stringify(existing) === JSON.stringify(snapshot)) {
    log(`没有变化（source=${snapshot.source}）`);
    return;
  }
  fs.mkdirSync(path.dirname(SNAPSHOT), { recursive: true });
  fs.writeFileSync(SNAPSHOT, `${JSON.stringify(snapshot, null, 2)}\n`);
  log(`已更新（source=${snapshot.source}）`);
}

main().catch((e) => warn(`意外错误，快照没有更新：${e.stack || e.message}`));
