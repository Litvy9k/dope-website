/**
 * UI 文案。结构和 nav/sections.js 的 label 一致，都是 { en, zh }。
 *
 * 只放"人读的词"。命令和语法（ls / cd / $ / ~ / F10 / ESC）不进这里 ——
 * 那是语法不是英语，翻译反而不对。
 */
const strings = {
  setup: { en: 'SETUP', zh: '设置' },
  close: { en: 'CLOSE', zh: '关闭' },

  scanlines: { en: 'Scanlines', zh: '扫描线' },
  sweep: { en: 'CRT Sweep', zh: '扫描光带' },
  flicker: { en: 'Screen Flicker', zh: '屏幕闪烁' },
  pixelFont: { en: 'Pixel Font', zh: '点阵字体' },

  // 语言开关两边都写"中文"：它要是跟着语言变，看不懂当前语言的人就找不到它了
  chinese: { en: '中文', zh: '中文' },

  home: { en: 'home', zh: '主页' },
  noSuchDir: { en: 'No such file or directory', zh: '没有那个文件或目录' },

  /*
   * /abt-me/github（pages/GitHubPage.jsx）。
   * {n} {m} 这类占位符由页面里的 fill() 填；英文的单复数词也是占位符
   * （{contributions} {repositories} …），中文模板里用不上就不写。
   * 页面上的 `$ gh …` 命令、api.github.com 这类地址是语法，不在这里。
   */
  github: { en: 'GitHub', zh: 'GitHub' },
  ghSource: { en: 'source', zh: '数据' },
  ghSnapshot: { en: 'snapshot', zh: '快照' },
  ghRestNote: {
    en: 'built without a token: no contribution calendar, pinned repos from a hand-kept list',
    zh: '构建时没有 token：没有贡献日历，置顶仓库按手写名单显示',
  },
  ghOffline: {
    en: 'could not reach api.github.com when this site was built',
    zh: '构建这个站的时候连不上 api.github.com',
  },
  ghOpen: { en: 'open on github.com', zh: '在 github.com 上打开' },
  ghLocation: { en: 'location', zh: '所在地' },
  ghWebsite: { en: 'website', zh: '网站' },
  ghRepos: { en: 'repositories', zh: '公开仓库' },
  ghOrgs: { en: 'organizations', zh: '组织' },
  ghPinned: { en: 'Pinned', zh: '置顶' },
  ghFork: { en: 'fork', zh: '派生' },
  ghStars: { en: 'stars', zh: '星标' },
  ghContribYear: { en: '{n} {contributions} in the last year', zh: '过去一年 {n} 次贡献' },
  ghDayTip: { en: '{n} {contributions} on {date}', zh: '{date}：{n} 次贡献' },
  ghLess: { en: 'Less', zh: '少' },
  ghMore: { en: 'More', zh: '多' },
  ghMon: { en: 'Mon', zh: '一' },
  ghWed: { en: 'Wed', zh: '三' },
  ghFri: { en: 'Fri', zh: '五' },
  ghNeedToken: {
    en: 'no calendar in this snapshot: it only exists in the GraphQL API, which needs a token at build time',
    zh: '这份快照里没有贡献日历：它只在 GraphQL API 里有，而 GraphQL 构建时必须带 token',
  },
  ghActivity: { en: 'Contribution activity', zh: '贡献动态' },
  ghCommits: { en: 'Created {n} {commits} in {m} {repositories}', zh: '在 {m} 个仓库中提交了 {n} 次' },
  ghPushes: { en: 'Pushed {n} {times} to {m} {repositories}', zh: '向 {m} 个仓库推送了 {n} 次' },
  ghCommitCount: { en: '{n} {commits}', zh: '{n} 次提交' },
  ghPushCount: { en: '{n} {pushes}', zh: '{n} 次推送' },
  ghCreated: { en: 'Created {n} {repositories}', zh: '创建了 {n} 个仓库' },
  ghNoActivity: { en: 'nothing this month yet', zh: '这个月还没有动静' },
};

export function t(key, lang) {
  return strings[key]?.[lang] ?? strings[key]?.en ?? key;
}
