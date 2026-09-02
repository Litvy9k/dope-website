// 占位。目前站点是纯静态的：文章是 content/ 下的 markdown，构建时读进去，
// 渲染、中英切换、评分筛选全在浏览器里跑，不需要服务端。
//
// 留着这个项目是为了以后放那些静态站真的做不到的东西：
//
//   · 藏 API key —— 查 TMDb / IGDB / Bangumi 补全封面、原名、年份。
//     密钥不能进前端，所以这一步必须有服务端（或者一个本地跑的 CLI）
//   · 评论 —— 访客提交的内容得有地方存
//   · 私密草稿 —— 静态构建会把所有内容发给浏览器，草稿藏不住
//   · 从 Steam / Trakt / Bangumi 同步"最近在看什么"，需要定时任务和凭据
//
// 在真的要做上面某一件之前，这里不该长出别的东西。

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// 部署时用来确认进程活着，没有别的用途
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
